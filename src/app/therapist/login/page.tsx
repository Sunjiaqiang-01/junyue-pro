"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TherapistLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/therapist?modal=login");
  }, [router]);

  return null;
}
