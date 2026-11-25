"use client";

import Captcha, { type CaptchaValue } from "@/app/components/captcha";
import { useI18n } from "@/lib/i18n/client";
import { useSmoothProgress } from "@/lib/use-smooth-progress";
import { compressImage, isCompressibleImage } from "@/lib/image-compress";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Paperclip,
  X,
} from "lucide-react";
import {
  FormEvent,
  useRef,
  useState,
} from "react";

type Status =
  | "idle"
  | "sending"
  | "sent"
  | "error";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
];

// Values stay in English (they're stored and emailed); labels are localized.
const services: [string, string][] = [
  ["Web Development", "ওয়েব ডেভেলপমেন্ট"],
  ["WordPress Solutions", "ওয়ার্ডপ্রেস সমাধান"],
  ["UI / UX Design", "ইউআই / ইউএক্স ডিজাইন"],
  ["Custom Development", "কাস্টম ডেভেলপমেন্ট"],
  ["E-commerce", "ই-কমার্স"],
  ["Care & Maintenance", "কেয়ার ও রক্ষণাবেক্ষণ"],
  ["Website Redesign", "ওয়েবসাইট রিডিজাইন"],
  ["Not sure yet", "এখনো নিশ্চিত নই"],
];

const budgets: [string, string][] = [
  ["Under $500", "$৫০০-এর কম"],
  ["$500 – $1,000", "$৫০০ – $১,০০০"],
  ["$1,000 – $2,500", "$১,০০০ – $২,৫০০"],
  ["$2,500 – $5,000", "$২,৫০০ – $৫,০০০"],
  ["$5,000+", "$৫,০০০+"],
  ["Let's discuss", "আলোচনা সাপেক্ষে"],
];

export default function ContactForm({
  defaultService = "",
  defaultMessage = "",
  initialCaptcha,
}: {
  defaultService?: string;
  defaultMessage?: string;
  initialCaptcha: { token: string; image: string };
}) {
  const { L, num } = useI18n();
  const [captcha, setCaptcha] = useState<CaptchaValue>({ token: initialCaptcha.token, answer: "" });
  const [captchaKey, setCaptchaKey] = useState(0);
  const [status, setStatus] =
    useState<Status>("idle");

  const [messageLength, setMessageLength] =
    useState(defaultMessage.length);

  const [file, setFile] =
    useState<File | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [compacting, setCompacting] =
    useState(false);
  const [compactProgress, setCompactProgress] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const shownCompact = useSmoothProgress(compactProgress);
  const shownUpload = useSmoothProgress(uploadProgress);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  /* ==========================================================
     FILE
  ========================================================== */

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    setErrorMessage("");

    /* --------------------------------------------------------
       ORIGINAL FILE SIZE
    -------------------------------------------------------- */

    // Photos of any size are compressed below; other files keep the 10 MB limit.
    if (
      selectedFile.size >
        MAX_FILE_SIZE &&
      !isCompressibleImage(selectedFile)
    ) {
      setErrorMessage(
        L("Attachment must be 10 MB or smaller.", "ফাইল সর্বোচ্চ ১০ MB হতে পারবে।")
      );

      event.target.value = "";
      setFile(null);

      return;
    }

    /* --------------------------------------------------------
       TYPE
    -------------------------------------------------------- */

    if (
      !ALLOWED_FILE_TYPES.includes(
        selectedFile.type
      )
    ) {
      setErrorMessage(
        L("Unsupported file type. Please upload PDF, image, Word, Excel, PowerPoint, or TXT files.", "এই ধরনের ফাইল চলবে না। PDF, ছবি, Word, Excel, PowerPoint বা TXT ফাইল দিন।")
      );

      event.target.value = "";
      setFile(null);

      return;
    }

    /* --------------------------------------------------------
       COMPACT IMAGE
    -------------------------------------------------------- */

    if (
      selectedFile.type.startsWith(
        "image/"
      ) &&
      selectedFile.type !==
        "image/gif"
    ) {
      try {
        setCompacting(true);

        setCompactProgress(0);
        const compacted =
          await compressImage(
            selectedFile,
            { onProgress: setCompactProgress }
          );

        setFile(compacted);
      } catch (error) {
        console.error(
          "Image compaction error:",
          error
        );

        if (selectedFile.size <= MAX_FILE_SIZE) {
          setFile(selectedFile);
        } else {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : L("Couldn't compress this image.", "ছবিটি ছোট করা যায়নি।")
          );
          event.target.value = "";
          setFile(null);
        }
      } finally {
        setCompacting(false);
        setCompactProgress(null);
      }

      return;
    }

    setFile(selectedFile);
  }

  function removeFile() {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function formatFileSize(
    size: number
  ) {
    if (
      size <
      1024 * 1024
    ) {
      return `${Math.ceil(
        size / 1024
      )} KB`;
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  /* ==========================================================
     UPLOAD TO R2
  ========================================================== */

  async function uploadToR2(
    file: File
  ): Promise<string> {
    /* --------------------------------------------------------
       STEP 1 — GET PRESIGNED URL
    -------------------------------------------------------- */

    const prepareResponse =
      await fetch(
        "/api/contact/upload",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            contentType:
              file.type ||
              "application/octet-stream",
            size: file.size,
          }),
        }
      );

    const prepareResult =
      await prepareResponse
        .json()
        .catch(() => null);

    if (!prepareResponse.ok) {
      throw new Error(
        prepareResult?.error ||
          L("Could not prepare attachment upload.", "ফাইল আপলোডের প্রস্তুতি নেওয়া যায়নি।")
      );
    }

    const {
      uploadUrl,
      key,
    } = prepareResult;

    if (!uploadUrl || !key) {
      throw new Error(
        "Invalid upload response."
      );
    }

    /* --------------------------------------------------------
       STEP 2 — DIRECT UPLOAD TO R2
    -------------------------------------------------------- */

    setUploadProgress(0);
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.upload.onprogress = (e) => e.lengthComputable && setUploadProgress(Math.round((e.loaded / e.total) * 100));
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(L("Attachment upload failed. Please try again.", "ফাইল আপলোড হয়নি। আবার চেষ্টা করুন।")));
        xhr.onerror = () => reject(new Error(L("Attachment upload failed. Check your connection.", "ফাইল আপলোড হয়নি। ইন্টারনেট সংযোগ দেখুন।")));
        xhr.send(file);
      });
    } finally {
      setUploadProgress(null);
    }

    /*
     * We return the R2 object key.
     *
     * The contact API will verify that
     * the object actually exists before
     * saving attachment_url.
     */
    return key;
  }

  /* ==========================================================
     SUBMIT
  ========================================================== */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (status === "sending") {
      return;
    }

    // Check what we can locally first, so the attachment is never uploaded
    // for a submission that is bound to fail.
    if (!captcha.answer.trim()) {
      setStatus("error");
      setErrorMessage(L("Please answer the security check.", "নিরাপত্তা প্রশ্নের উত্তর দিন।"));
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    const form = event.currentTarget;
    const fieldData = new FormData(form);

    try {
      /*
       * Step 1 — if there's an attachment, upload it directly to
       * R2 first, using the (possibly compacted) File held in
       * component state — NOT whatever is still sitting in the
       * raw <input> element, since that never reflects the
       * compacted result.
       */

      let attachmentKey: string | undefined;

      if (file) {
        attachmentKey = await uploadToR2(file);
      }

      /*
       * Step 2 — send the form fields + attachment key as JSON.
       * The file's bytes never touch this route; /api/contact
       * just verifies the key against R2 and saves the URL.
       */

      const response = await fetch(
        "/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fieldData.get("name"),
            email: fieldData.get("email"),
            phone: fieldData.get("phone"),
            service: fieldData.get("service"),
            budget: fieldData.get("budget"),
            preferred_contact_method: fieldData.get(
              "preferred_contact_method"
            ),
            message: fieldData.get("message"),
            attachmentKey,
            website: fieldData.get("website") || undefined,
            captchaToken: captcha.token,
            captchaAnswer: captcha.answer,
          }),
        }
      );

      const result =
        await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error ||
            L("Failed to submit contact form.", "ফর্ম জমা দেওয়া যায়নি।")
        );
      }

      setStatus("sent");
      setCaptchaKey((k) => k + 1);
      setFile(null);
      setMessageLength(0);

      form.reset();

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(
        "Contact submission error:",
        error
      );

      setStatus("error");
      setCaptchaKey((k) => k + 1); // each security check works once

      setErrorMessage(
        error instanceof Error
          ? error.message
          : L("We couldn't send your message. Please try again.", "আপনার বার্তা পাঠানো যায়নি। আবার চেষ্টা করুন।")
      );
    }
  }

  /* ==========================================================
     SUCCESS
  ========================================================== */

  if (status === "sent") {
    return <SuccessState />;
  }

  return (
    <>
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="border-b border-neutral-200 pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
          {L("Project inquiry", "প্রজেক্ট অনুসন্ধান")}
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
          {L("Tell us about your project", "আপনার প্রজেক্ট সম্পর্কে বলুন")}
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          {L("The more details you provide, the better we can understand what you need.", "যত বেশি বিস্তারিত জানাবেন, আপনার প্রয়োজন তত ভালোভাবে বুঝতে পারব।")}
        </p>
      </div>

      {/* ======================================================
          FORM
      ======================================================= */}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6"
        noValidate
      >
        {/* Honeypot — hidden from people, bots tend to fill it. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        {/* Name + Email */}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label={L("Name", "নাম")}
            name="name"
            type="text"
            placeholder={L("Your name", "আপনার নাম")}
            required
          />

          <Field
            label={L("Email", "ইমেইল")}
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>

        {/* Phone + Preferred contact */}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label={L("Phone", "ফোন")}
            name="phone"
            type="tel"
            placeholder="+880..."
          />

          <div>
            <label
              htmlFor="preferred_contact_method"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              {L("Preferred contact", "যোগাযোগের মাধ্যম")}
            </label>

            <select
              id="preferred_contact_method"
              name="preferred_contact_method"
              defaultValue="Email"
              className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
            >
              <option value="Email">
                {L("Email", "ইমেইল")}
              </option>

              <option value="Phone">
                {L("Phone", "ফোন")}
              </option>

              <option value="WhatsApp">
                WhatsApp
              </option>
            </select>
          </div>
        </div>

        {/* Service */}

        <div>
          <label
            htmlFor="service"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            {L("What can we help you with?", "কোন বিষয়ে সাহায্য চান?")}
          </label>

          <select
            id="service"
            name="service"
            required
            defaultValue={services.some(([value]) => value === defaultService) ? defaultService : ""}
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
          >
            <option
              value=""
              disabled
            >
              {L("Select a service", "একটি সার্ভিস বাছুন")}
            </option>

            {services.map(([value, bn]) => (
              <option key={value} value={value}>
                {L(value, bn)}
              </option>
            ))}
          </select>
        </div>

        {/* Budget */}

        <div>
          <label
            htmlFor="budget"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            {L("Estimated budget", "আনুমানিক বাজেট")}
          </label>

          <select
            id="budget"
            name="budget"
            defaultValue=""
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
          >
            <option
              value=""
              disabled
            >
              {L("Select a budget range", "বাজেটের সীমা বাছুন")}
            </option>

            {budgets.map(([value, bn]) => (
              <option key={value} value={value}>
                {L(value, bn)}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}

        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-neutral-800"
            >
              {L("Project details", "প্রজেক্টের বিবরণ")}
            </label>

            <span
              className={`text-xs ${
                messageLength >
                MAX_MESSAGE_LENGTH * 0.9
                  ? "text-red-500"
                  : "text-neutral-400"
              }`}
            >
              {num(messageLength)}/{num(MAX_MESSAGE_LENGTH)}
            </span>
          </div>

          <textarea
            id="message"
            name="message"
            required
            minLength={20}
            maxLength={
              MAX_MESSAGE_LENGTH
            }
            rows={7}
            defaultValue={defaultMessage}
            placeholder={L("Tell us about your project, goals, required features, timeline, existing website, or anything else that may help us understand your needs...", "আপনার প্রজেক্ট, লক্ষ্য, প্রয়োজনীয় ফিচার, সময়সীমা, বর্তমান ওয়েবসাইট — যা কিছু আপনার প্রয়োজন বুঝতে সাহায্য করবে, লিখুন...")}
            onChange={(event) =>
              setMessageLength(
                event.target.value.length
              )
            }
            className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm leading-6 text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
          />

          <p className="mt-2 text-xs text-neutral-400">
            {L("Please provide at least 20 characters.", "অন্তত ২০ অক্ষর লিখুন।")}
          </p>
        </div>

        {/* ====================================================
            ATTACHMENT
        ===================================================== */}

        <div>
          <label
            htmlFor="attachment"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            {L("Attachment", "ফাইল সংযুক্তি")}
            <span className="ml-1 font-normal text-neutral-400">
              {L("(optional)", "(ঐচ্ছিক)")}
            </span>
          </label>

          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 transition hover:border-neutral-400">
            {!file ? (
              <label
                htmlFor="attachment"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl bg-white px-5 py-7 text-center transition hover:bg-neutral-50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
                  <Paperclip className="h-5 w-5" />
                </div>

                <p className="mt-3 text-sm font-medium text-neutral-800">
                  {L("Attach a project file", "প্রজেক্টের ফাইল যুক্ত করুন")}
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  {L("PDF, images, Word, Excel, PowerPoint or TXT", "PDF, ছবি, Word, Excel, PowerPoint বা TXT")}
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  {L("Photos: any size (auto-compressed) · Documents: up to 10 MB", "ছবি: যেকোনো সাইজ (নিজে থেকে ছোট হয়) · ডকুমেন্ট: সর্বোচ্চ ১০ MB")}
                </p>

                <span className="mt-4 inline-flex h-9 items-center rounded-lg border border-neutral-200 bg-white px-4 text-xs font-semibold text-neutral-700 shadow-sm">
                  {L("Choose file", "ফাইল বাছুন")}
                </span>

                <input
                  ref={fileInputRef}
                  id="attachment"
                  name="attachment"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  onChange={
                    handleFileChange
                  }
                  className="sr-only"
                />
              </label>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                  <FileText className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-800">
                    {file.name}
                  </p>

                  <p className="mt-0.5 text-xs text-neutral-400">
                    {formatFileSize(
                      file.size
                    )}
                  </p>

                  {file.type ===
                    "image/webp" && (
                    <p className="mt-0.5 text-[11px] text-neutral-400">
                      {L("Compacted image", "ছোট করা ছবি")}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={
                    removeFile
                  }
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
                  aria-label={L("Remove attachment", "ফাইল সরান")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {compacting && (
            <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700" />
              {L("Optimizing image", "ছবি ছোট করা হচ্ছে")} {num(shownCompact)}%
              <span className="h-1 w-24 overflow-hidden rounded-full bg-neutral-200">
                <span className="block h-full bg-neutral-900" style={{ width: `${shownCompact}%` }} />
              </span>
            </div>
          )}
          {file && !compacting && (
            <p className="mt-2 text-xs text-neutral-400">{L("Uploaded only when you send the form.", "ফর্ম পাঠালে তবেই আপলোড হবে।")}</p>
          )}
        </div>

        {/* Error */}

        {status === "error" &&
          errorMessage && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <p className="font-medium">
                {L("We couldn't send your message.", "আপনার বার্তা পাঠানো যায়নি।")}
              </p>

              <p className="mt-1 text-xs text-red-600">
                {errorMessage}
              </p>
            </div>
          )}

        {/* Security check */}

        <div className="max-w-sm">
          <Captcha initial={initialCaptcha} refreshKey={captchaKey} onChange={setCaptcha} />
        </div>

        {/* Submit */}

        <div className="flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-xs leading-5 text-neutral-400">
            {L("By submitting this form, you agree that we may contact you regarding your inquiry.", "ফর্মটি জমা দিয়ে আপনি সম্মতি দিচ্ছেন যে এ বিষয়ে আমরা আপনার সঙ্গে যোগাযোগ করতে পারি।")}
          </p>

          <button
            type="submit"
            disabled={
              status === "sending" ||
              compacting
            }
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-black px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {uploadProgress !== null ? L(`Uploading ${shownUpload}%`, `আপলোড হচ্ছে ${num(shownUpload)}%`) : L("Sending...", "পাঠানো হচ্ছে...")}
              </>
            ) : (
              <>
                {L("Send inquiry", "বার্তা পাঠান")}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}

/* ============================================================
   FIELD
============================================================ */

function Field({
  label,
  name,
  type,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-neutral-800"
      >
        {label}

        {required && (
          <span className="ml-1 text-neutral-400">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
      />
    </div>
  );
}

/* ============================================================
   SUCCESS STATE
============================================================ */

function SuccessState() {
  const { L } = useI18n();
  return (
    <div className="flex min-h-[560px] flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-950 text-white shadow-lg">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <div className="mt-7">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
          {L("Message received", "বার্তা পৌঁছেছে")}
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950">
          {L("Thanks for reaching out.", "যোগাযোগের জন্য ধন্যবাদ।")}
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-500">
          {L("Your inquiry has been submitted successfully. We'll review the details and get back to you as soon as possible.", "আপনার অনুসন্ধান সফলভাবে জমা হয়েছে। বিস্তারিত দেখে আমরা যত দ্রুত সম্ভব যোগাযোগ করব।")}
        </p>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={() =>
            window.location.reload()
          }
          className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          {L("Send another inquiry", "আরেকটি বার্তা পাঠান")}
        </button>
      </div>
    </div>
  );
}