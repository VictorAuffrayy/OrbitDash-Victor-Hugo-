import { PollWidget }      from './PollWidget'
import { WeatherWidget }   from './WeatherWidget'
import { CryptoWidget }    from './CryptoWidget'
import { YoutubeWidget }   from './YoutubeWidget'
import { MorpionWidget }   from './MorpionWidget'
import { MarmitonWidget }  from './MarmitonWidget'
import { Game2048Widget }  from './Game2048Widget'

const REGISTRY = {
  poll:     PollWidget,
  weather:  WeatherWidget,
  crypto:   CryptoWidget,
  youtube:  YoutubeWidget,
  morpion:  MorpionWidget,
  marmiton: MarmitonWidget,
  game2048: Game2048Widget,
}

export function WidgetRenderer({ widget, mode = 'grid', onFullscreen }) {
  const Component = REGISTRY[widget.type]
  if (!Component) {
    return (
      <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13 }}>
        Type inconnu : <code>{widget.type}</code>
      </div>
    )
  }
  return <Component widget={widget} mode={mode} onFullscreen={onFullscreen} />
}