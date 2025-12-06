"use client"
import { useState } from "react";
import { motion } from "motion/react";

export const MailForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    message: "",
  });

  const [isMailSending, setIsMailSending] = useState(false);
  const [isMailSuccess, setIsMailSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsMailSuccess(false);

    // LOCAL VALIDATION (same as backend)
    const validationErrors: string[] = [];

    if (!formData.email || !validateEmail(formData.email)) {
      validationErrors.push("A valid email address is required.");
    }

    if (!formData.message || formData.message.trim().length < 10) {
      validationErrors.push("Message must be at least 10 characters long.");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsMailSending(true);

    try {
      const res = await fetch("/api/mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors || ["Something went wrong."]);
        setIsMailSending(false);
        return;
      }

      setIsMailSuccess(true);
      setFormData({ email: "", message: "" });

      setTimeout(() => setIsMailSuccess(false), 3000);
    } catch (error) {
      setErrors(["Failed to send message. Try again later."]);
    } finally {
      setIsMailSending(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-neutral-800 rounded-xl p-6 w-80  md:min-w-lg  shadow-lg relative"
      >
        <h2 className="text-2xl font-bold mb-4 text-balance dark:text-white text-center">
          Get in Touch
        </h2>

        {/* ERRORS */}
        {errors.length > 0 && (
          <div className="text-red-600 p-3 rounded mb-3 text-sm">
            {errors.map((err, i) => (
              <p key={i}>• {err}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none placeholder-zinc-400"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          {/* MESSAGE */}
          <div>
            <label className="block text-sm font-medium">
              Message
            </label>
            <textarea
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 h-28 resize-none focus:outline-none placeholder-zinc-400"
              placeholder="Your message..."
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            ></textarea>
          </div>

          {/* BUTTON OR LOADER */}
          {isMailSending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-400"></div>
            </div>
          ) : (
            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-lg transition text-white shadow 
                ${isMailSuccess
                  ? "bg-green-500"
                  : "bg-rose-500 hover:bg-rose-600"
                }`}
            >
              {isMailSuccess ? "Sent Successfully!" : "Send"}
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
};
