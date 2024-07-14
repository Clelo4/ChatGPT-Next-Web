import Home from "@pages/home";
import ErrorBoundary from "@components/ErrorBoundary";
import { StoreProvider } from "@app/store";
import AuthWrapper from "@components/AuthWrapper";

export default async function App() {
  return (
    <>
      <ErrorBoundary>
        <StoreProvider>
          <AuthWrapper>
            <Home />
          </AuthWrapper>
        </StoreProvider>
      </ErrorBoundary>
    </>
  );
}
