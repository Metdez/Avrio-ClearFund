import { CapitalProviderProfileClient } from "./capital-provider-profile-client";

export default async function CapitalProviderProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CapitalProviderProfileClient capitalProviderId={id} />;
}
