'use client';

import { type PropsWithChildren, useEffect } from 'react';

import '@mantine/core/styles.layer.css'
import '@mantine/dates/styles.layer.css'
import '@mantine/notifications/styles.layer.css'
import '@mantine/nprogress/styles.layer.css'

import {MantineProvider} from "@mantine/core";

import {
  initData,
  useLaunchParams,
  useSignal,
} from '@telegram-apps/sdk-react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorPage } from '@/components/ErrorPage';
import {Loading} from "@/components/Loading/Loading";
import { useDidMount } from '@/hooks/useDidMount';
import { useClientOnce } from '@/hooks/useClientOnce';
import { setLocale } from '@/core/i18n/locale';
import { init } from '@/core/init';
import {theme} from "@/config/theme";


function RootInner({ children }: PropsWithChildren) {
  const lp = useLaunchParams();
  const debug = lp.startParam === 'debug';

  // Initialize the library.
  useClientOnce(() => {
    init(debug);
  });
  const initDataUser = useSignal(initData.user);
  // Set the user locale.
  useEffect(() => {
    initDataUser && setLocale(initDataUser.languageCode);
  }, [initDataUser]);

  return (
      <>
        {children}
      </>
  );
}

export function Root(props: PropsWithChildren) {
  // Unfortunately, Telegram Mini Apps does not allow us to use all features of
  // the Server Side Rendering. That's why we are showing loader on the server
  // side.
    const didMount = useDidMount();

    return didMount ? (
        <MantineProvider defaultColorScheme="dark" theme={theme}>
            <ErrorBoundary fallback={ErrorPage}>
                <RootInner {...props} />
            </ErrorBoundary>
        </MantineProvider>
    ) : (
        <MantineProvider defaultColorScheme="dark" theme={theme}>
        <Loading />
        </MantineProvider>
    );
}
