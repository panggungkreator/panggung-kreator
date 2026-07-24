import React from "react";
import PackageForm from "@/components/admin/PackageForm";
import { getPackageAction } from "@/lib/actions/package-actions";
import { notFound } from "next/navigation";

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const { data: packageData, success } = await getPackageAction(resolvedParams.id);

  if (!success || !packageData) {
    return notFound();
  }

  return <PackageForm initialData={packageData} />;
}
