use chrono::Utc;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessClaims {
    pub sub: Uuid,
    pub role: String,
    pub org_id: Option<Uuid>,
    pub jti: Uuid,
    pub iat: i64,
    pub exp: i64,
    #[serde(rename = "type")]
    pub token_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RefreshClaims {
    pub sub: Uuid,
    pub jti: Uuid,
    pub session_id: Uuid,
    pub iat: i64,
    pub exp: i64,
    #[serde(rename = "type")]
    pub token_type: String,
}

pub struct JwtManager {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
    access_ttl_secs: i64,
    refresh_ttl_secs: i64,
}

impl JwtManager {
    pub fn new(secret: &str, access_ttl_secs: i64, refresh_ttl_secs: i64) -> Self {
        let secret_bytes = secret.as_bytes();
        Self {
            encoding_key: EncodingKey::from_secret(secret_bytes),
            decoding_key: DecodingKey::from_secret(secret_bytes),
            access_ttl_secs,
            refresh_ttl_secs,
        }
    }

    pub fn generate_access_token(
        &self,
        user_id: Uuid,
        role: &str,
        org_id: Option<Uuid>,
    ) -> Result<(String, Uuid), jsonwebtoken::errors::Error> {
        let now = Utc::now().timestamp();
        let jti = Uuid::new_v4();
        let claims = AccessClaims {
            sub: user_id,
            role: role.to_string(),
            org_id,
            jti,
            iat: now,
            exp: now + self.access_ttl_secs,
            token_type: "access".into(),
        };
        let token = encode(&Header::new(Algorithm::HS256), &claims, &self.encoding_key)?;
        Ok((token, jti))
    }

    pub fn generate_refresh_token(
        &self,
        user_id: Uuid,
        session_id: Uuid,
    ) -> Result<(String, Uuid), jsonwebtoken::errors::Error> {
        let now = Utc::now().timestamp();
        let jti = Uuid::new_v4();
        let claims = RefreshClaims {
            sub: user_id,
            jti,
            session_id,
            iat: now,
            exp: now + self.refresh_ttl_secs,
            token_type: "refresh".into(),
        };
        let token = encode(&Header::new(Algorithm::HS256), &claims, &self.encoding_key)?;
        Ok((token, jti))
    }

    pub fn verify_access_token(&self, token: &str) -> Result<AccessClaims, jsonwebtoken::errors::Error> {
        let mut validation = Validation::new(Algorithm::HS256);
        validation.validate_exp = true;
        let data = decode::<AccessClaims>(token, &self.decoding_key, &validation)?;
        if data.claims.token_type != "access" {
            return Err(jsonwebtoken::errors::Error::from(
                jsonwebtoken::errors::ErrorKind::InvalidToken,
            ));
        }
        Ok(data.claims)
    }

    pub fn verify_refresh_token(&self, token: &str) -> Result<RefreshClaims, jsonwebtoken::errors::Error> {
        let mut validation = Validation::new(Algorithm::HS256);
        validation.validate_exp = true;
        let data = decode::<RefreshClaims>(token, &self.decoding_key, &validation)?;
        if data.claims.token_type != "refresh" {
            return Err(jsonwebtoken::errors::Error::from(
                jsonwebtoken::errors::ErrorKind::InvalidToken,
            ));
        }
        Ok(data.claims)
    }

    /// Decode access token claims without validating expiry.
    /// Used only during logout to extract the JTI for Redis blacklisting —
    /// a token presented for logout may be seconds from expiry and we still
    /// want to invalidate it.
    pub fn decode_access_claims_unchecked(&self, token: &str) -> Option<AccessClaims> {
        let mut validation = Validation::new(Algorithm::HS256);
        validation.validate_exp = false;
        decode::<AccessClaims>(token, &self.decoding_key, &validation)
            .ok()
            .filter(|d| d.claims.token_type == "access")
            .map(|d| d.claims)
    }
}
