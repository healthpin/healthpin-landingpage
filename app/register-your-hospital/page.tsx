import type { Metadata } from "next";
import { HospitalRegistrationForm } from "@/components/registration/HospitalRegistrationForm";

export const metadata: Metadata = { title: "Register your hospital | Health Pin" };

export default function RegisterYourHospitalPage() { return <HospitalRegistrationForm />; }
