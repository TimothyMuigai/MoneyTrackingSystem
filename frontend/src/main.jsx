import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { ProfileProvider } from './context/ProfileContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { IncomeProvider } from './context/IncomeContext'
import { ExpenseProvider } from './context/ExpenseContext'
import { SubscriptionProvider } from './context/SubscriptionContext'
import { NotificationProvider } from './context/NotificationContext'
import { SettingsProvider } from './context/SettingsContext'
import { BudgetProvider } from './context/BudgetContext'
import { DataProvider } from './context/DataContext'

createRoot(document.getElementById('root')).render(
    <BrowserRouter> 
     <AuthProvider>
      <IncomeProvider>
        <ProfileProvider>
          <CurrencyProvider>
            <ExpenseProvider>
              <NotificationProvider>
                <SubscriptionProvider>
                  <SettingsProvider>
                    <BudgetProvider>
                      <DataProvider>
                        <App />
                      </DataProvider>
                    </BudgetProvider>
                  </SettingsProvider>
                </SubscriptionProvider>
              </NotificationProvider>
            </ExpenseProvider>
          </CurrencyProvider>
        </ProfileProvider>
      </IncomeProvider>
     </AuthProvider>      
    <Toaster richColors position="bottom-right" />
    </BrowserRouter>
)
