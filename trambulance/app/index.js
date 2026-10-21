import { registerRootComponent } from 'expo';
// Registers the background location task before the app renders (required by expo-task-manager)
import './src/lib/driverLocation';
import App from './App';

registerRootComponent(App);
