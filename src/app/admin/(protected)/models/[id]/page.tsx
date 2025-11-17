"use client";

import ModelForm from "@/components/admin/ModelForm";
import { useParams } from "next/navigation";

export default function AdminModelEditPage() {
  const params = useParams();
  const modelId = params?.id?.toString();

  if (!modelId) {
    return <div>ID do modelo não encontrado.</div>;
  }

  return <ModelForm modelId={modelId} />;
}

