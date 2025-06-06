'use client';

import { useEffect, useState } from 'react';
import { SkeletonCard } from '@inngest/components/Apps/AppCard';
import { Button } from '@inngest/components/Button';
import { Header } from '@inngest/components/Header/Header';
import { Info } from '@inngest/components/Info/Info';
import { Link } from '@inngest/components/Link/Link';
import { RiAddLine } from '@remixicon/react';

import AppFAQ from '@/components/Apps/AppFAQ';
import { EmptyOnboardingCard } from '@/components/Apps/EmptyAppsCard';
import { StatusMenu } from '@/components/Apps/StatusMenu';
import { getProdApps } from '@/components/Onboarding/actions';
import { staticSlugs } from '@/utils/environments';
import { pathCreator } from '@/utils/urls';
import { Apps } from './Apps';

const AppInfo = () => (
  <Info
    text="Apps map directly to your products or services."
    action={
      <Link href="https://www.inngest.com/docs/apps" target="_blank">
        Learn how apps work
      </Link>
    }
  />
);

type LoadingState = {
  hasProductionApps: boolean;
  isLoading: boolean;
};

async function fetchInitialData(): Promise<LoadingState> {
  try {
    const result = await getProdApps();
    if (!result) {
      // In case of data fetching error, we don't wanna fail the page here
      return { hasProductionApps: true, isLoading: false };
    }
    const { apps, unattachedSyncs } = result;
    const hasAppsOrUnattachedSyncs = apps.length > 0 || unattachedSyncs.length > 0;
    return { hasProductionApps: hasAppsOrUnattachedSyncs, isLoading: false };
  } catch (error) {
    console.error('Error fetching production apps', error);
    return { hasProductionApps: false, isLoading: false };
  }
}

export default function AppsPage({
  params: { environmentSlug: envSlug },
  searchParams: { archived },
}: {
  params: { environmentSlug: string };
  searchParams: { archived: string };
}) {
  const [{ hasProductionApps, isLoading }, setState] = useState<LoadingState>({
    hasProductionApps: true,
    isLoading: true,
  });

  const isArchived = archived === 'true';

  useEffect(() => {
    fetchInitialData().then((data) => {
      setState(data);
    });
  }, []);

  const displayOnboarding = envSlug === staticSlugs.production && !hasProductionApps;

  return (
    <>
      <Header
        breadcrumb={[{ text: 'Apps' }]}
        infoIcon={<AppInfo />}
        action={
          (!isArchived || displayOnboarding) && (
            <Button
              kind="primary"
              label="Sync new app"
              href={pathCreator.createApp({ envSlug })}
              icon={<RiAddLine />}
              iconSide="left"
            />
          )
        }
      />
      <div className="bg-canvasBase mx-auto flex h-full w-full max-w-4xl flex-col px-6 pb-4 pt-16">
        {isLoading ? (
          <div className="mb-4 flex items-center justify-center">
            <div className="mt-[50px] w-full max-w-4xl">
              <SkeletonCard />
            </div>
          </div>
        ) : (
          <>
            {displayOnboarding ? (
              <>
                <EmptyOnboardingCard />
                <AppFAQ />
              </>
            ) : (
              <>
                <div className="relative flex w-full flex-row justify-start">
                  <StatusMenu archived={isArchived} envSlug={envSlug} />
                </div>
                <Apps isArchived={isArchived} />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
