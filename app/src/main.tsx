import { render } from 'preact';
import '@fontsource-variable/fredoka';
import '@fontsource/luckiest-guy/latin-400.css';
import './styles.css';
import { App } from './app';

render(<App />, document.getElementById('app')!);
