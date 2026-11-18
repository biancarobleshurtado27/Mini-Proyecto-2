import HomePage from '../pages/HomePage'
import PoliciesPage from '../pages/PoliciesPage'
import MyDataPage from '../pages/MyDataPage'
import HelpPage from '../pages/HelpPage'

export function renderRoute(page, { setPage, role, token, Chat, Dashboard, chatDraft, clearChatDraft }) {
  const routes = {
    inicio: <HomePage setPage={setPage} role={role} />,
    chat: <Chat token={token} initialQuestion={chatDraft} onDraftUsed={clearChatDraft} />,
    politicas: <PoliciesPage setPage={setPage} />,
    datos: <MyDataPage setPage={setPage} />,
    ayuda: <HelpPage />,
    dashboard: <Dashboard token={token} />,
  }
  return routes[page] || routes.inicio
}
