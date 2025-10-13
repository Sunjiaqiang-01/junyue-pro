"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TherapistRegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/therapist?modal=register");
  }, [router]);

  return null;
}
