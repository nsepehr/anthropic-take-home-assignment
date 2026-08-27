import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { scriptedReply } from '../model/chatReply';
import { attentionSet, filterMenu, mentionOf, type Mentionable } from '../model/chatScope';
import {
  chatReducer,
  EMPTY_CHAT,
  lastMentionId,
  type ChatMessage,
  type ChatState,
} from '../model/chatThread';
import type { FoundEntity } from '../model/entities';
import { useProject } from './projectStore';

export interface Chat {
  open: boolean;
  toggle: () => void;
  draft: string;
  setDraft: (draft: string) => void;
  /** What the request is about, in the order it was tagged. */
  mentions: Mentionable[];
  addMention: (mention: Mentionable) => void;
  removeMention: (id: string) => void;
  /** Backspace on an empty composer drops the last chip; a no-op while there is text. */
  removeLastMention: () => void;
  messages: ChatMessage[];
  /** Appends the user turn and the scripted reply; the scope stays for the next question. */
  send: () => void;
  /** The system ids the mentions resolve to — what the canvas rings. Empty = nothing in scope. */
  attention: ReadonlySet<string>;
  /** Menu rows for the text typed after `@`, minus what is already tagged. */
  matches: (query: string) => Mentionable[];
  /** Changes whenever the composer should take focus (a mention button opened the drawer). */
  focusNonce: number;
}

const ChatContext = createContext<Chat | null>(null);

interface Props {
  children: ReactNode;
  /** Start from a given state (tests, stories). */
  initial?: Partial<ChatState>;
}

/** Holds the chat scope and thread; must sit inside <ProjectProvider>. No network, no writes. */
export function ChatProvider({ children, initial }: Props) {
  const { project } = useProject();
  const [state, dispatch] = useReducer(chatReducer, { ...EMPTY_CHAT, ...initial });
  // Actions read the latest state through a ref so their identities never change.
  const stateRef = useRef(state);
  stateRef.current = state;

  const toggle = useCallback(() => dispatch({ type: 'toggle' }), []);
  const setDraft = useCallback((draft: string) => dispatch({ type: 'setDraft', draft }), []);
  const addMention = useCallback(
    (mention: Mentionable) => dispatch({ type: 'addMention', mention }),
    [],
  );
  const removeMention = useCallback((id: string) => dispatch({ type: 'removeMention', id }), []);
  const removeLastMention = useCallback(() => {
    const id = lastMentionId(stateRef.current);
    if (id) dispatch({ type: 'removeMention', id });
  }, []);
  const send = useCallback(() => {
    if (!project) return;
    const { mentions, draft } = stateRef.current;
    dispatch({ type: 'send', reply: scriptedReply(project, mentions, draft) });
  }, [project]);
  const matches = useCallback(
    (query: string) =>
      project
        ? filterMenu(
            project,
            query,
            stateRef.current.mentions.map((m) => m.id),
          )
        : [],
    [project],
  );
  const attention = useMemo(
    () => new Set(project ? attentionSet(project, state.mentions) : []),
    [project, state.mentions],
  );

  const value = useMemo<Chat>(
    () => ({
      ...state,
      toggle,
      setDraft,
      addMention,
      removeMention,
      removeLastMention,
      send,
      attention,
      matches,
    }),
    [
      state,
      toggle,
      setDraft,
      addMention,
      removeMention,
      removeLastMention,
      send,
      attention,
      matches,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): Chat {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside <ChatProvider>');
  return ctx;
}

/** Props for the `@` button next to an entity: is it already in scope, and what it does. */
export function useMention(found: FoundEntity): {
  inScope: boolean;
  title: string;
  onClick: () => void;
} {
  const { mentions, addMention } = useChat();
  const mention = mentionOf(found);
  const inScope = mentions.some((m) => m.id === mention.id);
  return {
    inScope,
    title: inScope
      ? `${mention.label} is already in the chat scope`
      : `Tag ${mention.label} into the chat`,
    onClick: () => addMention(mention),
  };
}
