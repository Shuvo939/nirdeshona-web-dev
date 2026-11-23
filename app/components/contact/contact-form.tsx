"use client";

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

const services = [
  "Web Development",
  "WordPress Solutions",
  "UI / UX Design",
  "Custom Development",
  "E-commerce",
  "Care & Maintenance",
  "Website Redesign",
  "Not sure yet",
];

const budgets = [
  "Under $500",
  "$500 – $1,000",
  "$1,000 – $2,500",
  "$2,500 – $5,000",
  "$5,000+",
  "Let's discuss",
];

/* ============================================================
   IMAGE COMPRESSION
============================================================ */

async function compactImage(
  file: File
): Promise<File> {
  /*
   * GIF is deliberately kept untouched because
   * converting an animated GIF to WebP through
   * canvas would destroy the animation.
   */
  if (file.type === "image/gif") {
    return file;
  }

  if (
    ![
      "image/jpeg",
      "image/png",
      "image/webp",
    ].includes(file.type)
  ) {
    return file;
  }

  const bitmap =
    await createImageBitmap(file);

  try {
    /*
     * Don't allow unnecessarily huge
     * image dimensions.
     */
    const MAX_DIMENSION = 2400;

    const scale = Math.min(
      1,
      MAX_DIMENSION /
        Math.max(
          bitmap.width,
          bitmap.height
        )
    );

    const width = Math.max(
      1,
      Math.round(bitmap.width * scale)
    );

    const height = Math.max(
      1,
      Math.round(bitmap.height * scale)
    );

    const canvas =
      document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context =
      canvas.getContext("2d");

    if (!context) {
      return file;
    }

    context.drawImage(
      bitmap,
      0,
      0,
      width,
      height
    );

    const blob =
      await new Promise<Blob | null>(
        (resolve) =>
          canvas.toBlob(
            resolve,
            "image/webp",
            0.82
          )
      );

    if (!blob) {
      return file;
    }

    /*
     * Only use the compacted file if it
     * is actually smaller.
     */
    if (blob.size >= file.size) {
      return file;
    }

    const baseName =
      file.name.replace(
        /\.[^/.]+$/,
        ""
      );

    return new File(
      [blob],
      `${baseName}.webp`,
      {
        type: "image/webp",
        lastModified:
          Date.now(),
      }
    );
  } finally {
    bitmap.close();
  }
}

/* ============================================================
   COMPONENT
============================================================ */

export default function ContactForm({
  defaultService = "",
}: {
  defaultService?: string;
}) {
  const [status, setStatus] =
    useState<Status>("idle");

  const [messageLength, setMessageLength] =
    useState(0);

  const [file, setFile] =
    useState<File | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [compacting, setCompacting] =
    useState(false);

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

    if (
      selectedFile.size >
      MAX_FILE_SIZE
    ) {
      setErrorMessage(
        "Attachment must be 10 MB or smaller."
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
        "Unsupported file type. Please upload PDF, image, Word, Excel, PowerPoint, or TXT files."
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

        const compacted =
          await compactImage(
            selectedFile
          );

        setFile(compacted);
      } catch (error) {
        console.error(
          "Image compaction error:",
          error
        );

        /*
         * If compression fails,
         * safely fall back to original.
         */
        setFile(selectedFile);
      } finally {
        setCompacting(false);
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
          "Could not prepare attachment upload."
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

    const uploadResponse =
      await fetch(
        uploadUrl,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              file.type ||
              "application/octet-stream",
          },
          body: file,
        }
      );

    if (!uploadResponse.ok) {
      throw new Error(
        "Attachment upload failed. Please try again."
      );
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
          }),
        }
      );

      const result =
        await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Failed to submit contact form."
        );
      }

      setStatus("sent");
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

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't send your message. Please try again."
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
          Project inquiry
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
          Tell us about your project
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          The more details you provide,
          the better we can understand
          what you need.
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
            label="Name"
            name="name"
            type="text"
            placeholder="Your name"
            required
          />

          <Field
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>

        {/* Phone + Preferred contact */}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Phone"
            name="phone"
            type="tel"
            placeholder="+880..."
          />

          <div>
            <label
              htmlFor="preferred_contact_method"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Preferred contact
            </label>

            <select
              id="preferred_contact_method"
              name="preferred_contact_method"
              defaultValue="Email"
              className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
            >
              <option value="Email">
                Email
              </option>

              <option value="Phone">
                Phone
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
            What can we help you with?
          </label>

          <select
            id="service"
            name="service"
            required
            defaultValue={services.includes(defaultService) ? defaultService : ""}
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
          >
            <option
              value=""
              disabled
            >
              Select a service
            </option>

            {services.map(
              (service) => (
                <option
                  key={service}
                  value={service}
                >
                  {service}
                </option>
              )
            )}
          </select>
        </div>

        {/* Budget */}

        <div>
          <label
            htmlFor="budget"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Estimated budget
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
              Select a budget range
            </option>

            {budgets.map(
              (budget) => (
                <option
                  key={budget}
                  value={budget}
                >
                  {budget}
                </option>
              )
            )}
          </select>
        </div>

        {/* Message */}

        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-neutral-800"
            >
              Project details
            </label>

            <span
              className={`text-xs ${
                messageLength >
                MAX_MESSAGE_LENGTH * 0.9
                  ? "text-red-500"
                  : "text-neutral-400"
              }`}
            >
              {messageLength}/
              {MAX_MESSAGE_LENGTH}
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
            placeholder="Tell us about your project, goals, required features, timeline, existing website, or anything else that may help us understand your needs..."
            onChange={(event) =>
              setMessageLength(
                event.target.value.length
              )
            }
            className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm leading-6 text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
          />

          <p className="mt-2 text-xs text-neutral-400">
            Please provide at least
            20 characters.
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
            Attachment
            <span className="ml-1 font-normal text-neutral-400">
              (optional)
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
                  Attach a project file
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  PDF, images, Word,
                  Excel, PowerPoint
                  or TXT
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  Maximum size: 10 MB
                </p>

                <span className="mt-4 inline-flex h-9 items-center rounded-lg border border-neutral-200 bg-white px-4 text-xs font-semibold text-neutral-700 shadow-sm">
                  Choose file
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
                      Compacted image
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={
                    removeFile
                  }
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
                  aria-label="Remove attachment"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {compacting && (
            <p className="mt-2 text-xs text-neutral-400">
              Compacting image...
            </p>
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
                We couldn't send your
                message.
              </p>

              <p className="mt-1 text-xs text-red-600">
                {errorMessage}
              </p>
            </div>
          )}

        {/* Submit */}

        <div className="flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-xs leading-5 text-neutral-400">
            By submitting this form,
            you agree that we may
            contact you regarding your
            inquiry.
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
                Sending...
              </>
            ) : (
              <>
                Send inquiry
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
  return (
    <div className="flex min-h-[560px] flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-950 text-white shadow-lg">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <div className="mt-7">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
          Message received
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950">
          Thanks for reaching out.
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-500">
          Your inquiry has been
          submitted successfully.
          We&apos;ll review the details
          and get back to you as soon
          as possible.
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
          Send another inquiry
        </button>
      </div>
    </div>
  );
}