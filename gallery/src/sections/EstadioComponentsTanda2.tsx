import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { MediaCard } from '../../../src/MediaCard';
import { HorizontalRail } from '../../../src/HorizontalRail';
import { SessionPreview } from '../../../src/SessionPreview';
import { SessionComplete } from '../../../src/SessionComplete';
import { RescheduleSheet } from '../../../src/RescheduleSheet';
import { NotificationInbox } from '../../../src/NotificationInbox';
import { TextSizeControl } from '../../../src/TextSizeControl';
import { ChatBubble, QuickReplies } from '../../../src/ChatBubble';
import { ShareSummary } from '../../../src/ShareSummary';
import { Countdown } from '../../../src/Countdown';
import { BreathingGuide } from '../../../src/BreathingGuide';
import { MiniPlayer } from '../../../src/MiniPlayer';
import { PlayerControls } from '../../../src/PlayerControls';
import { SleepTimer, type SleepTimerValue } from '../../../src/SleepTimer';

const CLASSES = [
  { id: 'f1', title: 'Fuerza 01 · Tren inferior', meta: ['42 min', 'Intermedio'], progress: 0.6 },
  { id: 'f2', title: 'Fuerza 02 · Empuje', meta: ['38 min', 'Intermedio'], badge: 'Nuevo' },
  { id: 'm1', title: 'Movilidad de cadera', meta: ['15 min', 'Todos'] },
  { id: 'c1', title: 'Cardio por intervalos', meta: ['25 min', 'Avanzado'], locked: true },
];

const DAYS = [
  { value: '2026-11-23', label: 'Lunes', sublabel: '23 de noviembre', current: true },
  { value: '2026-11-24', label: 'Martes', sublabel: '24 de noviembre' },
  { value: '2026-11-25', label: 'Miércoles', sublabel: '25 de noviembre', disabled: true },
  { value: '2026-11-26', label: 'Jueves', sublabel: '26 de noviembre' },
];

const SIZES = [
  { value: 'md', label: 'Normal', scale: 1 },
  { value: 'lg', label: 'Grande', scale: 1.15 },
  { value: 'xl', label: 'Muy grande', scale: 1.3 },
];

/** Duración de la pieza de demostración de PlayerControls: 28 min. */
const PLAYER_DURATION = 1680;

const PLAYER_LABELS = {
  play: 'Reproducir',
  pause: 'Pausar',
  skipBack: 'Retroceder 10 segundos',
  skipForward: 'Avanzar 10 segundos',
  seek: 'Posición',
  elapsed: 'Transcurrido',
  remaining: 'Restante',
  mute: 'Silenciar',
  unmute: 'Activar sonido',
  enterFullscreen: 'Pantalla completa',
  exitFullscreen: 'Salir de pantalla completa',
  controls: 'Controles del reproductor',
};

const SLEEP_LABELS = {
  group: 'Detener en',
  minutes: (n: number) => `${n} min`,
  end: 'Al terminar la pista',
  endStatus: 'Se detendrá al terminar la pista',
  remaining: (time: string) => `Se detiene en ${time}`,
  cancel: 'Cancelar temporizador',
};

/** Second and third batch of pieces for the 5T4D10 look, shown under the preset. */
export function EstadioComponentsTanda2() {
  const [feeling, setFeeling] = useState<string | undefined>();
  const [sheet, setSheet] = useState(false);
  const [day, setDay] = useState<string | undefined>();
  const [size, setSize] = useState('md');
  const [read, setRead] = useState(false);
  const [counting, setCounting] = useState(false);
  const [countKey, setCountKey] = useState(0);
  const [breathing, setBreathing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ctrlPlaying, setCtrlPlaying] = useState(false);
  const [ctrlTime, setCtrlTime] = useState(200);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [sleep, setSleep] = useState<SleepTimerValue>(null);
  const [sleepLeft, setSleepLeft] = useState(0);

  // La demostración hace de reproductor: avanza el tiempo mientras suena y
  // cuenta atrás el temporizador. La librería no lleva ningún reloj propio.
  useEffect(() => {
    if (!ctrlPlaying) return undefined;
    const id = window.setInterval(() => setCtrlTime((t) => Math.min(PLAYER_DURATION, t + 1)), 1000);
    return () => window.clearInterval(id);
  }, [ctrlPlaying]);

  useEffect(() => {
    if (typeof sleep !== 'number') return undefined;
    const id = window.setInterval(() => setSleepLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [sleep]);

  useEffect(() => {
    if (typeof sleep === 'number' && sleepLeft === 0) {
      setSleep(null);
      setCtrlPlaying(false);
    }
  }, [sleep, sleepLeft]);

  const seekTo = (seconds: number) => setCtrlTime(Math.min(PLAYER_DURATION, Math.max(0, seconds)));

  return (
    <div data-testid="estadio-components-tanda-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 20, maxWidth: 390 }}>
      <Block title="MediaCard + HorizontalRail">
        <HorizontalRail ariaLabel="Clases de esta semana" prevLabel="Anteriores" nextLabel="Siguientes" itemWidth="220px">
          {CLASSES.map((item) => (
            <MediaCard
              key={item.id}
              title={item.title}
              eyebrow="8EIGHT Fuerza"
              meta={item.meta}
              badge={item.badge}
              progress={item.progress}
              progressLabel={item.progress ? '60 % visto' : undefined}
              locked={item.locked}
              lockedLabel="Incluido en INFINITY+"
              href="#"
            />
          ))}
        </HorizontalRail>
      </Block>

      <Block title="MediaCard · overlay">
        <MediaCard
          title="Fuerza total"
          eyebrow="Programa"
          meta={['8 semanas', '3 días por semana']}
          variant="overlay"
          aspect="4/5"
          displayTitle
          onClick={() => {}}
        />
      </Block>

      <Block title="SessionPreview">
        <SessionPreview
          headingLevel={3}
          eyebrow="8EIGHT Fuerza · Sesión 3"
          title="Tren inferior"
          facts={[
            { label: 'Duración', value: '42 min' },
            { label: 'Nivel', value: 'Intermedio' },
          ]}
          description="Sentadilla, peso muerto y trabajo unilateral."
          itemsTitle="Qué necesitas"
          items={['Mancuernas', 'Esterilla']}
          primaryLabel="Empezar"
          onPrimary={() => {}}
          secondaryLabel="Mover entreno"
          onSecondary={() => setSheet(true)}
        />
        <RescheduleSheet
          open={sheet}
          onClose={() => setSheet(false)}
          title="Mover entreno"
          description="Elige el día al que quieres pasarlo."
          days={DAYS}
          value={day}
          onChange={setDay}
          confirmLabel="Mover aquí"
          onConfirm={() => setSheet(false)}
          cancelLabel="Cancelar"
          currentLabel="Hoy está aquí"
        />
      </Block>

      <Block title="SessionComplete">
        <SessionComplete
          headingLevel={3}
          title="Sesión completada"
          description="Tercer entreno de la semana."
          stats={[
            { label: 'Duración', value: '42 min' },
            { label: 'Racha', value: '3 semanas' },
          ]}
          question="¿Cómo te ha ido?"
          options={[
            { value: 'easy', label: 'Fácil' },
            { value: 'right', label: 'Bien' },
            { value: 'hard', label: 'Duro' },
          ]}
          value={feeling}
          onSelect={setFeeling}
          primaryLabel="Listo"
          onPrimary={() => {}}
        />
      </Block>

      <Block title="ShareSummary">
        <ShareSummary
          headingLevel={3}
          eyebrow="5T4D10"
          title="Semana completada"
          figure="4"
          figureLabel="entrenos esta semana"
          stats={[
            { label: 'Minutos', value: '132' },
            { label: 'Racha', value: '3 sem' },
          ]}
          footnote="16–22 nov"
          shareLabel="Compartir"
          onShare={() => {}}
        />
      </Block>

      <Block title="NotificationInbox">
        <NotificationInbox
          headingLevel={3}
          ariaLabel="Notificaciones"
          title="Notificaciones"
          unreadLabel="Sin leer"
          emptyTitle="No tienes avisos"
          markAllReadLabel="Marcar todo como leído"
          onMarkAllRead={() => setRead(true)}
          items={[
            {
              id: 'a',
              title: 'Tu clase empieza en 30 minutos',
              body: 'Fuerza 01 · Tren inferior',
              time: 'hace 5 min',
              read,
              onClick: () => {},
            },
            { id: 'b', title: 'Ya puedes hacer tu check-in de noviembre', time: 'ayer', read, onClick: () => {} },
            { id: 'c', title: 'Nuevo programa disponible', time: 'lun', read: true },
          ]}
        />
      </Block>

      <Block title="ChatBubble + QuickReplies">
        <div style={{ display: 'grid', gap: 8 }}>
          <ChatBubble from="assistant" authorLabel="MIA" time="10:02">
            Hola. Hoy te toca tren inferior. ¿Lo dejamos así?
          </ChatBubble>
          <ChatBubble from="user" authorLabel="Tú" time="10:03">
            Prefiero moverlo a mañana.
          </ChatBubble>
          <ChatBubble from="assistant" authorLabel="MIA" typing typingLabel="MIA está escribiendo" />
          <QuickReplies
            ariaLabel="Sugerencias"
            options={[
              { value: 'today', label: '¿Qué entreno hoy?' },
              { value: 'move', label: 'Mover mi entreno' },
              { value: 'food', label: 'Ideas para cenar' },
            ]}
            onSelect={() => {}}
          />
        </div>
      </Block>

      <Block title="Countdown">
        <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
          <Countdown
            key={countKey}
            running={counting}
            onDone={() => setCounting(false)}
            label="La sesión empieza en"
            doneLabel="¡Vamos!"
            skipLabel="Saltar"
          />
          <button
            type="button"
            style={demoButton}
            onClick={() => {
              setCountKey((k) => k + 1);
              setCounting(true);
            }}
          >
            Reiniciar cuenta atrás
          </button>
        </div>
      </Block>

      <Block title="BreathingGuide">
        <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
          <BreathingGuide
            ariaLabel="Respiración guiada"
            running={breathing}
            showSeconds
            phases={[
              { label: 'Inhala', seconds: 4, kind: 'in' },
              { label: 'Mantén', seconds: 4, kind: 'hold' },
              { label: 'Exhala', seconds: 6, kind: 'out' },
            ]}
          />
          <button type="button" style={demoButton} onClick={() => setBreathing((v) => !v)}>
            {breathing ? 'Pausar' : 'Empezar'}
          </button>
        </div>
      </Block>

      <Block title="MiniPlayer">
        <div style={{ position: 'relative', height: 72, transform: 'translateZ(0)' }}>
          <MiniPlayer
            ariaLabel="Reproduciendo ahora"
            title="Fuerza 01 · Tren inferior"
            subtitle="Quedan 18 min"
            playing={playing}
            onToggle={() => setPlaying((v) => !v)}
            playLabel="Reproducir"
            pauseLabel="Pausar"
            progress={0.6}
            progressLabel="60 % visto"
            onExpand={() => {}}
            expandLabel="Abrir el reproductor"
            onClose={() => {}}
            closeLabel="Cerrar"
          />
        </div>
      </Block>

      <Block title="PlayerControls">
        <div style={{ display: 'grid', gap: 20 }}>
          <PlayerControls
            playing={ctrlPlaying}
            currentTime={ctrlTime}
            duration={PLAYER_DURATION}
            buffered={900}
            muted={muted}
            fullscreen={fullscreen}
            onPlayPause={() => setCtrlPlaying((v) => !v)}
            onSeek={seekTo}
            onSkip={(delta) => seekTo(ctrlTime + delta)}
            onToggleMute={() => setMuted((v) => !v)}
            onToggleFullscreen={() => setFullscreen((v) => !v)}
            labels={PLAYER_LABELS}
            formatValueText={(elapsed, total) => `${elapsed} de ${total}`}
          />
          <PlayerControls
            compact
            playing={ctrlPlaying}
            currentTime={ctrlTime}
            duration={PLAYER_DURATION}
            onPlayPause={() => setCtrlPlaying((v) => !v)}
            onSeek={seekTo}
            onSkip={(delta) => seekTo(ctrlTime + delta)}
            labels={{ ...PLAYER_LABELS, seek: 'Posición del audio', controls: undefined }}
            formatValueText={(elapsed, total) => `${elapsed} de ${total}`}
          />
          <PlayerControls
            playing={false}
            currentTime={0}
            duration={0}
            canSkip={false}
            onPlayPause={() => {}}
            onSeek={() => {}}
            onSkip={() => {}}
            labels={{ ...PLAYER_LABELS, seek: 'Posición (directo)', controls: undefined }}
          />
        </div>
      </Block>

      <Block title="SleepTimer">
        <SleepTimer
          options={[5, 10, 15, 30]}
          value={sleep}
          remainingSeconds={typeof sleep === 'number' ? sleepLeft : undefined}
          onChange={(next) => {
            setSleep(next);
            setSleepLeft(typeof next === 'number' ? next * 60 : 0);
          }}
          labels={SLEEP_LABELS}
        />
      </Block>

      <Block title="TextSizeControl">
        <TextSizeControl
          ariaLabel="Tamaño del texto"
          options={SIZES}
          value={size}
          onChange={setSize}
          sampleText="Así se verá el texto en la app."
        />
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 style={blockTitle}>{title}</h3>
      {children}
    </section>
  );
}

const demoButton: CSSProperties = {
  minHeight: 44,
  padding: '0 16px',
  background: 'var(--ui-surface-raised)',
  color: 'var(--ui-text)',
  border: '1px solid var(--ui-border-control)',
  borderRadius: 'var(--ui-radius-full)',
  fontFamily: 'inherit',
  fontSize: '0.875rem',
  cursor: 'pointer',
};

const blockTitle: CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--ui-text-secondary)',
  margin: '0 0 12px',
};
