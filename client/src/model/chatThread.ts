import { stripMentionQuery, type Mentionable } from './chatScope';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** What was in scope when the turn was sent; drawn as chips above a user bubble. */
  mentions: Mentionable[];
}

export interface ChatState {
  open: boolean;
  draft: string;
  mentions: Mentionable[];
  messages: ChatMessage[];
  /** Bumped whenever the composer should take focus (mention buttons open the drawer). */
  focusNonce: number;
}

export type ChatAction =
  | { type: 'toggle' }
  | { type: 'setDraft'; draft: string }
  | { type: 'addMention'; mention: Mentionable }
  | { type: 'removeMention'; id: string }
  /** The reply is computed by the caller (it needs the project), so the reducer stays pure data. */
  | { type: 'send'; reply: string };

export const EMPTY_CHAT: ChatState = {
  open: false,
  draft: '',
  mentions: [],
  messages: [],
  focusNonce: 0,
};

/** Pure: the whole chat is a fold over these five actions, so the provider holds no logic. */
export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'toggle':
      return { ...state, open: !state.open };
    case 'setDraft':
      return { ...state, draft: action.draft };
    case 'addMention': {
      const known = state.mentions.some((m) => m.id === action.mention.id);
      return {
        ...state,
        open: true,
        focusNonce: state.focusNonce + 1,
        draft: stripMentionQuery(state.draft),
        mentions: known ? state.mentions : [...state.mentions, action.mention],
      };
    }
    case 'removeMention':
      return { ...state, mentions: state.mentions.filter((m) => m.id !== action.id) };
    case 'send': {
      const text = state.draft.trim();
      if (text === '' && state.mentions.length === 0) return state;
      const n = state.messages.length;
      return {
        ...state,
        draft: '',
        messages: [
          ...state.messages,
          { id: `m${n}`, role: 'user', text, mentions: state.mentions },
          { id: `m${n + 1}`, role: 'assistant', text: action.reply, mentions: [] },
        ],
      };
    }
  }
}

/** Backspace on an empty composer drops the last chip — the id to remove, or null. */
export function lastMentionId(state: ChatState): string | null {
  return state.draft === '' ? (state.mentions[state.mentions.length - 1]?.id ?? null) : null;
}
