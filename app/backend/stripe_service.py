import os
import stripe


def get_stripe_client():
    secret_key = os.getenv("STRIPE_SECRET_KEY")

    if not secret_key:
        raise RuntimeError(
            "STRIPE_SECRET_KEY environment variable is not set"
        )

    return stripe.StripeClient(secret_key)