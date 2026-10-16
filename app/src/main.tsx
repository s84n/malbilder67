import { render } from 'preact';
import '@fontsource-variable/fredoka';
import './styles.css';
import { App } from './app';

render(<App />, document.getElementById('app')!);
