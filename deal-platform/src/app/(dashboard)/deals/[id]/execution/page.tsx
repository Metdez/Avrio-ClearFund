import { ExecutionWorkspace } from "./_components/execution-workspace";

type ExecutionPageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function ExecutionPage({ params }: ExecutionPageProps) {
  const resolved = await params;
  return <ExecutionWorkspace dealId={resolved.id} />;
}
