// import { PublicKey } from "@solana/web3.js";

import TwitterApi from "twitter-api-v2";

// const mint = new PublicKey("7WAFfQAEaB4Gpp4xRvbjHmS6mLPSdJjtTB3NTiLdpump");
// const pump = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");

// const [pool]= PublicKey.findProgramAddressSync([Buffer.from("bonding-curve"),mint.toBuffer()],pump);

// console.log("pool:",pool.toBase58());
const twitterClient = new TwitterApi('AAAAAAAAAAAAAAAAAAAAAB8qxgEAAAAA49lqd5ZMvZhNjMzi29wrMjPMnDw%3DSsP2lGyJd1x3zbNgwCf4arONR89THX1BeYhwufcjBDYTYVnG22');
twitterClient.v2.singleTweet("1937236803771125865",
    {
        "media.fields": [
            "alt_text",
            "duration_ms",
            "height",
            "media_key",
            "preview_image_url",
            "public_metrics",
            "type",
            "url",
            "variants",
            "width"
        ],
        "user.fields": ["public_metrics",],
        "tweet.fields": [
            "article",
            "attachments",
            "author_id",
            "context_annotations",
            "conversation_id",
            "created_at",
            "edit_controls",
            "edit_history_tweet_ids",
            "entities",
            "geo",
            "id",
            "in_reply_to_user_id",
            "lang",
            "note_tweet",
            "possibly_sensitive",
            "public_metrics",
            "referenced_tweets",
            "reply_settings",
            "source",
            "text",
            "withheld"
        ],

    }
).then(res => {
    console.log(res);
})