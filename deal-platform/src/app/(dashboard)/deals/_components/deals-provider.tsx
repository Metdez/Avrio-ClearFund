"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  borrowers as initialBorrowers,
  capitalProviders as initialCapitalProviders,
  dealCapitalProviders as initialDealCapitalProviders,
  deals as initialDeals,
  engagementThreads as initialEngagementThreads,
  tasks as initialTasks,
  users,
} from "@/mock-data";
import type {
  Borrower,
  CapitalProvider,
  Deal,
  DealCapitalProvider,
  EngagementThread,
  PipelineStage,
  Task,
  User,
} from "@/types";

export interface DealFormInput {
  name: string;
  borrowerId: string;
  capitalProviderIds?: string[];
  projectType?: string;
  location?: string;
  estimatedDealSize?: number;
  traditionalFinancingPct?: number;
  paceFinancingPct?: number;
  notes?: string;
}

interface DealsContextValue {
  currentUser: User;
  borrowers: Borrower[];
  activeBorrowers: Borrower[];
  capitalProviders: CapitalProvider[];
  activeCapitalProviders: CapitalProvider[];
  deals: Deal[];
  dealCapitalProviders: DealCapitalProvider[];
  engagementThreads: EngagementThread[];
  tasks: Task[];
  createDeal: (input: DealFormInput) => Deal;
  updateDeal: (dealId: string, input: DealFormInput) => void;
  archiveDeal: (dealId: string) => void;
  updateDealStage: (
    dealId: string,
    stage: PipelineStage,
    options?: { reason?: string }
  ) => void;
  addCapitalProviderToDeal: (dealId: string, capitalProviderId: string) => void;
  updateCapitalProviderStatus: (
    linkId: string,
    status: DealCapitalProvider["status"]
  ) => void;
  updateDealCapitalProviderNotes: (linkId: string, notes: string) => void;
  getDealById: (dealId: string) => Deal | undefined;
  getBorrowerById: (borrowerId: string) => Borrower | undefined;
  getCapitalProviderById: (capitalProviderId: string) => CapitalProvider | undefined;
  getDealLinks: (dealId: string) => DealCapitalProvider[];
  getDealTasks: (dealId: string) => Task[];
}

const DealsContext = createContext<DealsContextValue | null>(null);

function createPrefixedId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function normalizeText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function DealsProvider({ children }: { children: ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [dealCapitalProviders, setDealCapitalProviders] =
    useState<DealCapitalProvider[]>(initialDealCapitalProviders);
  const [engagementThreads, setEngagementThreads] =
    useState<EngagementThread[]>(initialEngagementThreads);

  const currentUser = users[0];
  const borrowers = initialBorrowers;
  const capitalProviders = initialCapitalProviders;
  const tasks = initialTasks;

  const activeBorrowers = useMemo(
    () => borrowers.filter((borrower) => !borrower.isArchived),
    [borrowers]
  );
  const activeCapitalProviders = useMemo(
    () => capitalProviders.filter((provider) => !provider.isArchived),
    [capitalProviders]
  );

  const createDeal = (input: DealFormInput) => {
    const timestamp = new Date().toISOString();

    const newDeal: Deal = {
      id: createPrefixedId("deal"),
      name: input.name.trim(),
      borrowerId: input.borrowerId,
      projectType: normalizeText(input.projectType),
      location: normalizeText(input.location),
      estimatedDealSize: input.estimatedDealSize,
      traditionalFinancingPct: input.traditionalFinancingPct,
      paceFinancingPct: input.paceFinancingPct,
      pipelineStage: "Prospect",
      notes: normalizeText(input.notes),
      isArchived: false,
      createdBy: currentUser.id,
      createdAt: timestamp,
      updatedBy: currentUser.id,
      updatedAt: timestamp,
    };

    setDeals((current) => [newDeal, ...current]);

    if (input.capitalProviderIds?.length) {
      const linkTimestamp = new Date().toISOString();
      const newLinks: DealCapitalProvider[] = [];
      const newThreads: EngagementThread[] = [];

      for (const cpId of input.capitalProviderIds) {
        const provider = capitalProviders.find((item) => item.id === cpId);
        const threadId = createPrefixedId("thr");

        newThreads.push({
          id: threadId,
          capitalProviderId: cpId,
          dealId: newDeal.id,
          type: "Deal Evaluation",
          title: `${newDeal.name} - ${provider?.firmName ?? "Capital Provider"} Evaluation`,
          description: "Deal evaluation thread created during deal creation.",
          status: "Active",
          createdBy: currentUser.id,
          createdAt: linkTimestamp,
          updatedBy: currentUser.id,
          updatedAt: linkTimestamp,
        });

        newLinks.push({
          id: createPrefixedId("dcp"),
          dealId: newDeal.id,
          capitalProviderId: cpId,
          status: "Pitched",
          engagementThreadId: threadId,
          createdAt: linkTimestamp,
          updatedAt: linkTimestamp,
        });
      }

      setEngagementThreads((current) => [...newThreads, ...current]);
      setDealCapitalProviders((current) => [...newLinks, ...current]);
    }

    return newDeal;
  };

  const updateDeal = (dealId: string, input: DealFormInput) => {
    const timestamp = new Date().toISOString();

    setDeals((current) =>
      current.map((deal) =>
        deal.id === dealId
          ? {
              ...deal,
              name: input.name.trim(),
              borrowerId: input.borrowerId,
              projectType: normalizeText(input.projectType),
              location: normalizeText(input.location),
              estimatedDealSize: input.estimatedDealSize,
              traditionalFinancingPct: input.traditionalFinancingPct,
              paceFinancingPct: input.paceFinancingPct,
              notes: normalizeText(input.notes),
              updatedBy: currentUser.id,
              updatedAt: timestamp,
            }
          : deal
      )
    );
  };

  const archiveDeal = (dealId: string) => {
    const timestamp = new Date().toISOString();

    setDeals((current) =>
      current.map((deal) =>
        deal.id === dealId
          ? {
              ...deal,
              isArchived: true,
              archivedAt: timestamp,
              updatedBy: currentUser.id,
              updatedAt: timestamp,
            }
          : deal
      )
    );
  };

  const updateDealStage = (
    dealId: string,
    stage: PipelineStage,
    options?: { reason?: string }
  ) => {
    const timestamp = new Date().toISOString();

    setDeals((current) =>
      current.map((deal) => {
        if (deal.id !== dealId || deal.pipelineStage === stage) {
          return deal;
        }

        return {
          ...deal,
          pipelineStage: stage,
          executionStartDate:
            stage === "Execution" && !deal.executionStartDate
              ? timestamp
              : deal.executionStartDate,
          terminationReason:
            stage === "Terminated" ? normalizeText(options?.reason) : undefined,
          updatedBy: currentUser.id,
          updatedAt: timestamp,
        };
      })
    );
  };

  const addCapitalProviderToDeal = (dealId: string, capitalProviderId: string) => {
    const timestamp = new Date().toISOString();
    const existingThread = engagementThreads.find(
      (thread) =>
        thread.dealId === dealId &&
        thread.capitalProviderId === capitalProviderId &&
        thread.type === "Deal Evaluation"
    );

    const threadId = existingThread?.id ?? createPrefixedId("thr");

    if (!existingThread) {
      const provider = capitalProviders.find((item) => item.id === capitalProviderId);
      const deal = deals.find((item) => item.id === dealId);

      setEngagementThreads((current) => [
        {
          id: threadId,
          capitalProviderId,
          dealId,
          type: "Deal Evaluation",
          title: `${deal?.name ?? "Deal"} - ${provider?.firmName ?? "Capital Provider"} Evaluation`,
          description: "Deal evaluation thread created from the deal detail page.",
          status: "Active",
          createdBy: currentUser.id,
          createdAt: timestamp,
          updatedBy: currentUser.id,
          updatedAt: timestamp,
        },
        ...current,
      ]);
    }

    setDealCapitalProviders((current) => [
      {
        id: createPrefixedId("dcp"),
        dealId,
        capitalProviderId,
        status: "Pitched",
        engagementThreadId: threadId,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      ...current,
    ]);
  };

  const updateCapitalProviderStatus = (
    linkId: string,
    status: DealCapitalProvider["status"]
  ) => {
    const timestamp = new Date().toISOString();

    setDealCapitalProviders((current) =>
      current.map((link) =>
        link.id === linkId
          ? {
              ...link,
              status,
              updatedAt: timestamp,
            }
          : link
      )
    );
  };

  const updateDealCapitalProviderNotes = (linkId: string, notes: string) => {
    const timestamp = new Date().toISOString();
    const trimmed = notes.trim();

    setDealCapitalProviders((current) =>
      current.map((link) =>
        link.id === linkId
          ? {
              ...link,
              notes: trimmed || undefined,
              updatedAt: timestamp,
            }
          : link
      )
    );
  };

  const value = useMemo<DealsContextValue>(
    () => ({
      currentUser,
      borrowers,
      activeBorrowers,
      capitalProviders,
      activeCapitalProviders,
      deals,
      dealCapitalProviders,
      engagementThreads,
      tasks,
      createDeal,
      updateDeal,
      archiveDeal,
      updateDealStage,
      addCapitalProviderToDeal,
      updateCapitalProviderStatus,
      updateDealCapitalProviderNotes,
      getDealById: (dealId) => deals.find((deal) => deal.id === dealId),
      getBorrowerById: (borrowerId) =>
        borrowers.find((borrower) => borrower.id === borrowerId),
      getCapitalProviderById: (capitalProviderId) =>
        capitalProviders.find((provider) => provider.id === capitalProviderId),
      getDealLinks: (dealId) =>
        dealCapitalProviders.filter((link) => link.dealId === dealId),
      getDealTasks: (dealId) => tasks.filter((task) => task.dealId === dealId),
    }),
    [
      activeBorrowers,
      activeCapitalProviders,
      borrowers,
      capitalProviders,
      currentUser,
      dealCapitalProviders,
      deals,
      engagementThreads,
      tasks,
    ]
  );

  return <DealsContext.Provider value={value}>{children}</DealsContext.Provider>;
}

export function useDeals() {
  const context = useContext(DealsContext);

  if (!context) {
    throw new Error("useDeals must be used within a DealsProvider");
  }

  return context;
}
