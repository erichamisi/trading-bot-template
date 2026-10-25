import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ToastContainer } from 'react-toastify';
import AuthLoadingWrapper from '@/components/auth-loading-wrapper';
import useLiveChat from '@/components/chat/useLiveChat';
import ChunkLoader from '@/components/loader/chunk-loader';
import { getUrlBase } from '@/components/shared';
import TransactionDetailsModal from '@/components/transaction-details';
import { api_base, ApiHelpers, ServerTime } from '@/external/bot-skeleton';
import { CONNECTION_STATUS } from '@/external/bot-skeleton/services/api/observables/connection-status-stream';
import { useApiBase } from '@/hooks/useApiBase';
import useDevMode from '@/hooks/useDevMode';
import { useStore } from '@/hooks/useStore';
import useThemeSwitcher from '@/hooks/useThemeSwitcher';
import { ThemeProvider } from '@deriv-com/quill-ui';
import { setSmartChartsPublicPath } from '@deriv-com/smartcharts-champion';
import { localize } from '@deriv-com/translations';
import Audio from '../components/audio';
import BlocklyLoading from '../components/blockly-loading';
import BotStopped from '../components/bot-stopped';
import BotBuilder from '../pages/bot-builder';
import Main from '../pages/main';
import './app.scss';
import 'react-toastify/dist/ReactToastify.css';
import '../components/bot-notification/bot-notification.scss';

const AppContent = observer(() => {
    const [is_api_initialized, setIsApiInitialized] = React.useState(false);
    const [is_loading, setIsLoading] = React.useState(true);
    const [startup_error, setStartupError] = React.useState(false);

    const store = useStore();
    const { app, transactions, common, client } = store;
    const { is_dark_mode_on } = useThemeSwitcher();

    const { recovered_transactions, recoverPendingContracts } = transactions;
    const is_subscribed_to_msg_listener = React.useRef(false);
    const msg_listener = React.useRef(null);
    const { connectionStatus } = useApiBase();

    // Initialize dev mode keyboard shortcuts
    useDevMode();

    const livechat_client_information = {
        is_client_store_initialized: client?.is_logged_in ? true : !!client,
        is_logged_in: client?.is_logged_in,
        loginid: client?.loginid,
        currency: client?.currency,
        residence: client?.residence,
        email: '',
        first_name: '',
        last_name: '',
    };

    useLiveChat(livechat_client_information);

    // NOTE: Disabled Intercom until further notice
    // const token = V2GetActiveToken() ?? null;
    // useIntercom(token);

    useEffect(() => {
        if (connectionStatus === CONNECTION_STATUS.OPENED) {
            setIsApiInitialized(true);
            common.setSocketOpened(true);
        } else if (connectionStatus !== CONNECTION_STATUS.OPENED) {
            common.setSocketOpened(false);
        }
    }, [common, connectionStatus]);

    const { current_language } = common;
    const html = document.documentElement;
    React.useEffect(() => {
        html?.setAttribute('lang', current_language.toLowerCase());
        html?.setAttribute('dir', current_language.toLowerCase() === 'ar' ? 'rtl' : 'ltr');
    }, [current_language, html]);

    const handleMessage = React.useCallback(
        ({ data }) => {
            if (data?.msg_type === 'proposal_open_contract' && !data?.error) {
                const { proposal_open_contract } = data;
                if (
                    proposal_open_contract?.status !== 'open' &&
                    !recovered_transactions?.includes(proposal_open_contract?.contract_id)
                ) {
                    recoverPendingContracts(proposal_open_contract);
                }
            }
        },
        [recovered_transactions, recoverPendingContracts]
    );

    React.useEffect(() => {
        setSmartChartsPublicPath(getUrlBase('/js/smartcharts/'));
    }, []);

    React.useEffect(() => {
        // Check if api is initialized and then subscribe to the api messages
        // Also we should only subscribe to the messages once user is logged in
        // And is not already subscribed to the messages
        if (!is_subscribed_to_msg_listener.current && client.is_logged_in && is_api_initialized && api_base?.api) {
            is_subscribed_to_msg_listener.current = true;
            msg_listener.current = api_base.api.onMessage()?.subscribe(handleMessage);
        }
        return () => {
            if (is_subscribed_to_msg_listener.current && msg_listener.current) {
                is_subscribed_to_msg_listener.current = false;
                msg_listener.current.unsubscribe?.();
            }
        };
    }, [is_api_initialized, client.is_logged_in, client.loginid, handleMessage, connectionStatus]);

    const init = () => {
        ServerTime.init(common);
        app.setDBotEngineStores();
        ApiHelpers.setInstance(app.api_helpers_store);
        import('@/utils/gtm').then(({ default: GTM }) => {
            GTM.init(store);
        });
    };

    // Market data failure must not leave the entire application behind an endless spinner.
    // Broker requests remain blocked by DigitLab's existing outbound trading policy.
    const changeActiveSymbolLoadingState = () => {
        init();
        const activeSymbols = ApiHelpers?.instance?.active_symbols;
        if (!activeSymbols) {
            setStartupError(true);
            setIsLoading(false);
            return;
        }
        Promise.resolve()
            .then(() => activeSymbols.retrieveActiveSymbols(true))
            .then(() => {
                setStartupError(false);
                setIsLoading(false);
            })
            .catch(error => {
                console.warn('DigitLab market data not available:', error);
                setStartupError(true);
                setIsLoading(false);
            });
    };

    React.useEffect(() => {
        if (is_api_initialized) {
            init();
            setIsLoading(true);
            if (!client.is_logged_in) {
                changeActiveSymbolLoadingState();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [is_api_initialized]);

    React.useEffect(() => {
        if (client.is_logged_in && is_api_initialized) {
            changeActiveSymbolLoadingState();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [is_api_initialized, client.loginid]);

    // The editor can remain accessible when the market socket is unavailable.
    // We do not enable demo or real orders; network mutation controls stay fail-closed.
    React.useEffect(() => {
        if (!is_loading) return;
        const timeout = setTimeout(() => {
            setStartupError(true);
            setIsLoading(false);
        }, 12000);
        return () => clearTimeout(timeout);
    }, [is_loading]);

    if (common?.error) return null;

    return is_loading ? (
        <ChunkLoader message={localize('Initializing Deriv Bot account...')} />
    ) : (
        <AuthLoadingWrapper>
            <ThemeProvider theme={is_dark_mode_on ? 'dark' : 'light'}>
                {startup_error && (
                    <div role='status' style={{ padding: '12px 16px', background: '#fff1ce', color: '#3b2e12', fontSize: '14px' }}>
                        Market connection is unavailable. Strategy editing may still work, but trading is disabled.
                        <button type='button' style={{ marginLeft: '12px' }} onClick={() => window.location.reload()}>
                            Retry connection
                        </button>
                    </div>
                )}
                <BlocklyLoading />
                <div className='bot-dashboard bot' data-testid='dt_bot_dashboard'>
                    <Audio />
                    <Main />
                    <BotBuilder />
                    <BotStopped />
                    <TransactionDetailsModal />
                    <ToastContainer limit={3} draggable={false} />
                </div>
            </ThemeProvider>
        </AuthLoadingWrapper>
    );
});

export default AppContent;
