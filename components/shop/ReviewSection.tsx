"use client";
import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Star, BadgeCheck, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addReview, editReview, deleteReview } from "@/actions/review";

export function ReviewSection({ product, reviews: initial }: { product: any; reviews: any[] }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();

  // Rating statistics
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star, count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

  const submit = () => {
    if (!session) {
      toast.error("Please log in to review");
      return;
    }
    if (comment.length < 5) {
      toast.error("Comment too short");
      return;
    }
    startTransition(async () => {
      const res = editing
        ? await editReview(editing._id, { rating, title, comment })
        : await addReview(product._id, { rating, title, comment });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (editing) {
        setReviews((p) => p.map((r) => (r._id === editing._id ? res.review : r)));
      } else {
        setReviews((p) => [res.review, ...p]);
      }
      toast.success(editing ? "Review updated" : "Review added");
      setShowForm(false); setEditing(null); setComment(""); setTitle(""); setRating(5);
    });
  };

  const remove = (id: string) => startTransition(async () => {
    await deleteReview(id);
    setReviews((p) => p.filter((r) => r._id !== id));
    toast.success("Review deleted");
  });

  const startEdit = (r: any) => { setEditing(r); setRating(r.rating); setTitle(r.title || ""); setComment(r.comment); setShowForm(true); };

  return (
    <section className="mt-16 border-t border-stone-100 pt-12">
      <h2 className="font-serif text-3xl mb-8">Customer Reviews</h2>
      <div className="grid md:grid-cols-3 gap-10">
        {/* Stats */}
        <div>
          <div className="text-center md:text-left">
            <p className="text-5xl font-serif">{avg.toFixed(1)}</p>
            <div className="flex gap-1 justify-center md:justify-start my-2">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`h-5 w-5 ${s <= Math.round(avg) ? "fill-gold-400 text-gold-400" : "text-stone-200"}`} />)}
            </div>
            <p className="text-sm text-stone-500">{reviews.length} reviews</p>
          </div>
          <div className="mt-6 space-y-2">
            {dist.map((d) => (
              <div key={d.star} className="flex items-center gap-2 text-sm">
                <span className="w-3">{d.star}</span><Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gold-400" style={{ width: `${reviews.length ? (d.count / reviews.length) * 100 : 0}%` }} />
                </div>
                <span className="w-6 text-stone-400">{d.count}</span>
              </div>
            ))}
          </div>
          <Button className="mt-6 w-full" onClick={() => { setEditing(null); setShowForm(!showForm); }}>Write a Review</Button>
        </div>

        {/* List + form */}
        <div className="md:col-span-2">
          {showForm && (
            <div className="bg-cream-100 dark:bg-stone-800 rounded-2xl p-6 mb-6">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)}>
                    <Star className={`h-6 w-6 ${s <= (hover || rating) ? "fill-gold-400 text-gold-400" : "text-stone-300"}`} />
                  </button>
                ))}
              </div>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Review title (optional)" className="w-full h-11 px-4 rounded-xl bg-white dark:bg-stone-900 outline-none text-sm mb-3" />
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Share your experience..." className="w-full px-4 py-3 rounded-xl bg-white dark:bg-stone-900 outline-none text-sm mb-3" />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
                <Button onClick={submit} disabled={pending}>{pending ? "Submitting..." : editing ? "Update Review" : "Submit Review"}</Button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {reviews.length === 0 && <p className="text-stone-400 text-sm">No reviews yet. Be the first!</p>}
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-stone-100 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-sage-100 grid place-items-center text-sage-600 font-medium overflow-hidden">
                      {r.avatar ? <img src={r.avatar} className="h-full w-full object-cover" /> : r.name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">{r.name}
                        {r.verifiedPurchase && <span className="flex items-center gap-1 text-green-600 text-xs"><BadgeCheck className="h-3.5 w-3.5" /> Verified</span>}
                      </p>
                      <div className="flex gap-0.5">{[1,2,3,4,5].map((s) => <Star key={s} className={`h-3 w-3 ${s <= r.rating ? "fill-gold-400 text-gold-400" : "text-stone-200"}`} />)}</div>
                    </div>
                  </div>
                  {session?.user?.id === (r.user?._id || r.user) && (
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(r)}><Edit className="h-4 w-4 text-stone-400 hover:text-sage-600" /></button>
                      <button onClick={() => remove(r._id)}><Trash2 className="h-4 w-4 text-stone-400 hover:text-red-500" /></button>
                    </div>
                  )}
                </div>
                {r.title && <p className="font-medium text-sm mt-3">{r.title}</p>}
                <p className="text-sm text-stone-600 mt-1">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
