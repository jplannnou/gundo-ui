import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  content: string;
  createdAt: string | Date;
  /** Optional badge (e.g. "Admin", "Bot") */
  badge?: string;
  /** Nested replies */
  replies?: Comment[];
}

export interface CommentThreadProps {
  comments: Comment[];
  currentUser?: { name: string; avatar?: string; initials?: string };
  onAddComment?: (content: string, parentId?: string) => void | Promise<void>;
  onDeleteComment?: (id: string) => void;
  placeholder?: string;
  submitLabel?: string;
  emptyMessage?: string;
  loading?: boolean;
  /** Max nesting depth (default: 2) */
  maxDepth?: number;
  /** Slot rendered above the input (e.g. attachments) */
  inputAddon?: ReactNode;
  className?: string;
}

/* ─── CommentThread ───────────────────────────────────────────────────── */

export function CommentThread({
  comments,
  currentUser,
  onAddComment,
  onDeleteComment,
  placeholder = 'Escribe un comentario…',
  submitLabel = 'Comentar',
  emptyMessage = 'Sé el primero en comentar.',
  loading = false,
  maxDepth = 2,
  inputAddon,
  className = '',
}: CommentThreadProps) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Comment list */}
      <div className="flex flex-col gap-3">
        {comments.length === 0 ? (
          <p className="text-sm text-[var(--ui-text-muted)]">{emptyMessage}</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={onAddComment}
              onDelete={onDeleteComment}
              depth={0}
              maxDepth={maxDepth}
            />
          ))
        )}
      </div>

      {/* Composer */}
      {onAddComment && (
        <CommentComposer
          author={currentUser}
          onSubmit={(content) => onAddComment(content)}
          placeholder={placeholder}
          submitLabel={submitLabel}
          loading={loading}
          addon={inputAddon}
        />
      )}
    </div>
  );
}

/* ─── CommentItem ─────────────────────────────────────────────────────── */

interface CommentItemProps {
  comment: Comment;
  onReply?: (content: string, parentId: string) => void | Promise<void>;
  onDelete?: (id: string) => void;
  depth: number;
  maxDepth: number;
}

function CommentItem({ comment, onReply, onDelete, depth, maxDepth }: CommentItemProps) {
  const [showReply, setShowReply] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);

  const handleReply = async (content: string) => {
    if (!onReply) return;
    setReplyLoading(true);
    try {
      await onReply(content, comment.id);
      setShowReply(false);
    } finally {
      setReplyLoading(false);
    }
  };

  const dateStr =
    comment.createdAt instanceof Date
      ? comment.createdAt.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date(comment.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className={depth > 0 ? 'ml-8 border-l border-[var(--ui-border)] pl-4' : ''}>
      <div className="flex gap-3">
        <AuthorAvatar
          name={comment.author.name}
          avatar={comment.author.avatar}
          initials={comment.author.initials}
          size={depth === 0 ? 'md' : 'sm'}
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-semibold text-[var(--ui-text)]">{comment.author.name}</span>
            {comment.badge && (
              <span className="rounded-full bg-[var(--ui-primary-soft)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ui-primary)]">
                {comment.badge}
              </span>
            )}
            <time
              dateTime={String(comment.createdAt)}
              className="text-xs text-[var(--ui-text-muted)]"
            >
              {dateStr}
            </time>
          </div>
          <p className="mt-0.5 text-sm text-[var(--ui-text-secondary)] whitespace-pre-line">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="mt-1.5 flex items-center gap-3">
            {onReply && depth < maxDepth && (
              <button
                type="button"
                onClick={() => setShowReply((v) => !v)}
                className="text-xs text-[var(--ui-text-muted)] transition-colors hover:text-[var(--ui-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ui-primary)] rounded"
              >
                Responder
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                aria-label={`Eliminar comentario de ${comment.author.name}`}
                className="text-xs text-[var(--ui-text-muted)] transition-colors hover:text-[var(--ui-error)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ui-error)] rounded"
              >
                Eliminar
              </button>
            )}
          </div>

          {showReply && (
            <div className="mt-3">
              <CommentComposer
                onSubmit={handleReply}
                placeholder={`Responder a ${comment.author.name}…`}
                submitLabel="Responder"
                loading={replyLoading}
                compact
              />
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 flex flex-col gap-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── CommentComposer ─────────────────────────────────────────────────── */

interface CommentComposerProps {
  author?: { name: string; avatar?: string; initials?: string };
  onSubmit: (content: string) => void | Promise<void>;
  placeholder?: string;
  submitLabel?: string;
  loading?: boolean;
  compact?: boolean;
  addon?: ReactNode;
}

function CommentComposer({
  author,
  onSubmit,
  placeholder = 'Escribe un comentario…',
  submitLabel = 'Comentar',
  loading = false,
  compact = false,
  addon,
}: CommentComposerProps) {
  const [value, setValue] = useState('');
  const textareaId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    await onSubmit(trimmed);
    setValue('');
    textareaRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      {author && !compact && (
        <AuthorAvatar name={author.name} avatar={author.avatar} initials={author.initials} />
      )}
      <div className="flex-1 flex flex-col gap-2">
        {addon}
        <div className="overflow-hidden rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-hover)] focus-within:border-[var(--ui-primary)] focus-within:ring-1 focus-within:ring-[var(--ui-primary)] transition-colors">
          <label htmlFor={textareaId} className="sr-only">
            {placeholder}
          </label>
          <textarea
            id={textareaId}
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            rows={compact ? 2 : 3}
            className="block w-full resize-none bg-transparent px-3 py-2 text-sm text-[var(--ui-text)] placeholder:text-[var(--ui-text-muted)] outline-none"
          />
          <div className="flex items-center justify-end border-t border-[var(--ui-border)] px-3 py-2">
            <button
              type="submit"
              disabled={!value.trim() || loading}
              className="flex items-center gap-2 rounded-lg bg-[var(--ui-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--ui-surface)] transition-colors hover:bg-[var(--ui-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

/* ─── AuthorAvatar ────────────────────────────────────────────────────── */

interface AuthorAvatarProps {
  name: string;
  avatar?: string;
  initials?: string;
  size?: 'sm' | 'md';
}

function AuthorAvatar({ name, avatar, initials, size = 'md' }: AuthorAvatarProps) {
  const dim = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const text = size === 'sm' ? 'text-[10px]' : 'text-xs';

  const fallback =
    initials ??
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  return (
    <div
      className={`${dim} shrink-0 rounded-full bg-[var(--ui-primary-soft)] text-[var(--ui-primary)] flex items-center justify-center overflow-hidden ${text} font-semibold`}
      aria-hidden="true"
    >
      {avatar ? (
        <img src={avatar} alt={name} className="h-full w-full object-cover" />
      ) : (
        fallback
      )}
    </div>
  );
}
