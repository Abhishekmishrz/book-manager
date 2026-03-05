import mongoose, { Document, Schema } from 'mongoose';

export type ReadingStatus = 'want_to_read' | 'reading' | 'completed' | 'paused' | 'dropped';

export interface IBook extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  author: string;
  cover?: string;
  genre?: string;
  pages?: number;
  publishedYear?: number;
  isbn?: string;
  status: ReadingStatus;
  rating?: number;
  review?: string;
  startedAt?: Date;
  finishedAt?: Date;
  tags: string[];
  favourite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    cover: { type: String },
    genre: { type: String, trim: true },
    pages: { type: Number, min: 1 },
    publishedYear: { type: Number },
    isbn: { type: String, trim: true },
    status: {
      type: String,
      enum: ['want_to_read', 'reading', 'completed', 'paused', 'dropped'],
      default: 'want_to_read',
    },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String, trim: true },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    tags: [{ type: String, trim: true }],
    favourite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BookSchema.index({ user: 1, status: 1 });
BookSchema.index({ user: 1, author: 1 });
BookSchema.index({ user: 1, genre: 1 });
BookSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<IBook>('Book', BookSchema);
