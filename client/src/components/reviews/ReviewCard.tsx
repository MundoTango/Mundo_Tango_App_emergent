import { useState } from "react";
import { format } from "date-fns";
import { StarRating } from "./StarRating";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { HostReview, GuestReview } from "@shared/schema";

interface ReviewCardProps {
  review: HostReview | GuestReview;
  type: "host" | "guest";
  canRespond?: boolean;
}

export function ReviewCard({ review, type, canRespond = false }: ReviewCardProps) {
  const { toast } = useToast();
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState("");

  const isHostReview = type === "host";
  const hasResponse = isHostReview
    ? !!(review as HostReview).host_response
    : !!(review as GuestReview).guest_response;

  const submitResponseMutation = useMutation({
    mutationFn: async (response: string) => {
      const endpoint = isHostReview
        ? `/api/host-reviews/${review.id}/response`
        : `/api/guest-reviews/${review.id}/response`;

      return apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify({ response }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Response posted",
        description: "Your response has been added successfully.",
      });
      setShowResponseForm(false);
      setResponseText("");
      queryClient.invalidateQueries({ queryKey: ["/api/host-homes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to post response",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitResponse = () => {
    if (!responseText.trim()) {
      toast({
        title: "Response required",
        description: "Please enter a response.",
        variant: "destructive",
      });
      return;
    }

    submitResponseMutation.mutate(responseText);
  };

  return (
    <Card className="p-6" data-testid={`review-card-${review.id}`}>
      <div className="flex gap-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src="" />
          <AvatarFallback>
            {isHostReview ? "G" : "H"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-medium">
                {isHostReview ? "Guest" : "Host"} Review
              </p>
              <p className="text-sm text-gray-500">
                {review.created_at && format(new Date(review.created_at), "MMMM d, yyyy")}
              </p>
            </div>
            <StarRating rating={review.rating} readonly size="sm" />
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2 mb-4">
            {isHostReview && (
              <>
                {(review as HostReview).cleanliness_rating && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-32 text-gray-600">Cleanliness:</span>
                    <StarRating
                      rating={(review as HostReview).cleanliness_rating!}
                      readonly
                      size="sm"
                    />
                  </div>
                )}
                {(review as HostReview).communication_rating && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-32 text-gray-600">Communication:</span>
                    <StarRating
                      rating={(review as HostReview).communication_rating!}
                      readonly
                      size="sm"
                    />
                  </div>
                )}
                {(review as HostReview).location_rating && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-32 text-gray-600">Location:</span>
                    <StarRating
                      rating={(review as HostReview).location_rating!}
                      readonly
                      size="sm"
                    />
                  </div>
                )}
                {(review as HostReview).value_rating && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-32 text-gray-600">Value:</span>
                    <StarRating
                      rating={(review as HostReview).value_rating!}
                      readonly
                      size="sm"
                    />
                  </div>
                )}
                {(review as HostReview).accuracy_rating && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-32 text-gray-600">Accuracy:</span>
                    <StarRating
                      rating={(review as HostReview).accuracy_rating!}
                      readonly
                      size="sm"
                    />
                  </div>
                )}
              </>
            )}

            {!isHostReview && (
              <>
                {(review as GuestReview).respect_rating && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-32 text-gray-600">Respect:</span>
                    <StarRating
                      rating={(review as GuestReview).respect_rating!}
                      readonly
                      size="sm"
                    />
                  </div>
                )}
                {(review as GuestReview).cleanliness_rating && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-32 text-gray-600">Cleanliness:</span>
                    <StarRating
                      rating={(review as GuestReview).cleanliness_rating!}
                      readonly
                      size="sm"
                    />
                  </div>
                )}
                {(review as GuestReview).communication_rating && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-32 text-gray-600">Communication:</span>
                    <StarRating
                      rating={(review as GuestReview).communication_rating!}
                      readonly
                      size="sm"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Review Text */}
          {review.review_text && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {review.review_text}
            </p>
          )}

          {/* Photos */}
          {isHostReview && (review as HostReview).photos && (review as HostReview).photos!.length > 0 && (
            <div className="flex gap-2 mb-4">
              {(review as HostReview).photos!.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Review photo ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Response */}
          {hasResponse && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium mb-1">
                {isHostReview ? "Host" : "Guest"} Response
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isHostReview
                  ? (review as HostReview).host_response
                  : (review as GuestReview).guest_response}
              </p>
              {(isHostReview
                ? (review as HostReview).host_response_at
                : (review as GuestReview).guest_response_at) && (
                <p className="text-xs text-gray-500 mt-1">
                  {format(
                    new Date(
                      (isHostReview
                        ? (review as HostReview).host_response_at
                        : (review as GuestReview).guest_response_at) as Date
                    ),
                    "MMMM d, yyyy"
                  )}
                </p>
              )}
            </div>
          )}

          {/* Response Form */}
          {canRespond && !hasResponse && (
            <div className="mt-4">
              {!showResponseForm ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResponseForm(true)}
                  data-testid="button-respond"
                >
                  Respond
                </Button>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response..."
                    rows={3}
                    data-testid="input-response"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSubmitResponse}
                      disabled={submitResponseMutation.isPending}
                      data-testid="button-submit-response"
                    >
                      {submitResponseMutation.isPending ? "Posting..." : "Post Response"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowResponseForm(false)}
                      data-testid="button-cancel-response"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
