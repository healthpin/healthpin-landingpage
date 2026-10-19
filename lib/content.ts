export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Find Care", href: "#find-care" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Medical Vault", href: "#medical-vault" },
] as const;

export const steps = [
  { n: "01", title: "Discover", text: "Find hospitals and doctors that match your needs." },
  { n: "02", title: "Book", text: "Choose an available appointment slot that works for you." },
  {
    n: "03",
    title: "Save",
    text: "Keep your prescriptions and important health documents in your digital vault.",
  },
] as const;
