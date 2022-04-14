/**
 * @format
 */

import { AppRegistry } from 'react-native'
import App from './App'
import { name as appName } from './app.json'
import { Provider as PaperProvider } from 'react-native-paper'

const Provider = () => (
  <PaperProvider>
    <App />
  </PaperProvider>
)

AppRegistry.registerComponent(appName, () => App)
