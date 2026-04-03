import { BorrowerProfileClient } from "./borrower-profile-client";

export default async function BorrowerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BorrowerProfileClient borrowerId={id} />;
}
