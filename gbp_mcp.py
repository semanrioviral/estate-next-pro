"""
Google Business Profile MCP Server

Proporciona herramientas para gestionar Google Business Profile:
- list_locations: Listar ubicaciones del negocio
- get_business_information: Obtener detalles de una ubicación
- get_reviews: Obtener reseñas
- reply_to_review: Responder a una reseña
- delete_review_reply: Eliminar respuesta a reseña
- create_post: Crear publicación (oferta, evento, noticia)
- delete_post: Eliminar publicación
- get_insights: Estadísticas de rendimiento

Requiere: API access aprobado por Google (quota por defecto 0/min)
"""

import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import google.auth.transport.requests
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from mcp.server.fastmcp import FastMCP

# ─── Configuration ────────────────────────────────────────────────────────────

SCOPES = [
    "https://www.googleapis.com/auth/business.manage",
]

BASE_DIR = Path(__file__).parent
OAUTH_CREDS = BASE_DIR / "gbp-oauth.json"
TOKEN_FILE = BASE_DIR / "gbp_token.json"

# ─── Authentication ──────────────────────────────────────────────────────────

def get_credentials() -> Credentials:
    """Get or refresh OAuth credentials."""
    creds = None
    if TOKEN_FILE.exists():
        with open(TOKEN_FILE) as f:
            creds = Credentials.from_authorized_user_info(json.load(f), SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not OAUTH_CREDS.exists():
                raise RuntimeError(
                    f"No se encuentra {OAUTH_CREDS}. "
                    "Crea un cliente OAuth de escritorio en Google Cloud Console."
                )
            flow = InstalledAppFlow.from_client_secrets_file(str(OAUTH_CREDS), SCOPES)
            creds = flow.run_local_server(port=8080, prompt="consent")
        with open(TOKEN_FILE, "w") as f:
            f.write(creds.to_json())
    return creds


def build_service(service_name: str, version: str = "v1"):
    """Build a Google API service instance."""
    creds = get_credentials()
    return build(service_name, version, credentials=creds, cache_discovery=False)


# ─── MCP Server ───────────────────────────────────────────────────────────────

mcp = FastMCP(
    "gbp-mcp",
    instructions="""Google Business Profile MCP Server.

Herramientas disponibles:
- list_locations: Listar todas las ubicaciones del negocio
- get_business_information: Obtener detalles de una ubicación específica
- get_reviews: Obtener reseñas de clientes
- reply_to_review: Responder a una reseña
- delete_review_reply: Eliminar una respuesta existente
- create_post: Crear publicación (oferta, evento, noticia, producto)
- delete_post: Eliminar una publicación
- get_insights: Obtener métricas de rendimiento

Nota: Las APIs de GBP requieren aprobación de Google (quota 0/min por defecto).
""",
)


@mcp.tool(
    name="list_locations",
    description="Listar todas las ubicaciones de Google Business Profile asociadas a tu cuenta",
)
def list_locations() -> str:
    """Obtiene todas las ubicaciones del negocio."""
    try:
        api = build_service("mybusinessaccountmanagement")
        accounts = api.accounts().list().execute()
        account_items = accounts.get("accounts", [])

        if not account_items:
            return json.dumps({"error": "No se encontraron cuentas de Google Business."}, indent=2)

        all_locations = []
        bi_api = build_service("mybusinessbusinessinformation")

        for account in account_items:
            account_name = account["name"]
            locations = (
                bi_api.accounts()
                .locations()
                .list(parent=account_name, pageSize=100)
                .execute()
            )
            for loc in locations.get("locations", []):
                all_locations.append({
                    "name": loc.get("name"),
                    "title": loc.get("title") or loc.get("locationName", ""),
                    "phone": loc.get("primaryPhone", ""),
                    "website": loc.get("websiteUrl", ""),
                    "address": loc.get("address", {}),
                    "category": loc.get("category", {}),
                    "labels": loc.get("labels", []),
                })

        return json.dumps(
            {"count": len(all_locations), "locations": all_locations},
            indent=2,
            ensure_ascii=False,
        )
    except Exception as e:
        return json.dumps({"error": str(e)}, indent=2)


@mcp.tool(
    name="get_business_information",
    description="Obtener información detallada de una ubicación específica",
)
def get_business_information(location_name: str) -> str:
    """Obtiene detalles de una ubicación por su resource name (accounts/.../locations/...)."""
    try:
        api = build_service("mybusinessbusinessinformation")
        location = api.locations().get(name=location_name).execute()
        return json.dumps(
            {
                "name": location.get("name"),
                "title": location.get("title"),
                "phone": location.get("primaryPhone"),
                "website": location.get("websiteUrl"),
                "address": location.get("address"),
                "category": location.get("category"),
                "openInfo": location.get("openInfo"),
                "profile": location.get("profile"),
                "metadata": location.get("metadata"),
            },
            indent=2,
            ensure_ascii=False,
        )
    except Exception as e:
        return json.dumps({"error": str(e)}, indent=2)


@mcp.tool(
    name="get_reviews",
    description="Obtener reseñas de clientes para una ubicación",
)
def get_reviews(location_name: str, page_size: int = 50) -> str:
    """Obtiene reseñas de una ubicación."""
    try:
        api = build_service("mybusinessaccountmanagement")
        reviews = (
            api.accounts()
            .locations()
            .reviews()
            .list(parent=location_name, pageSize=page_size)
            .execute()
        )
        review_list = []
        for r in reviews.get("reviews", []):
            review_list.append({
                "name": r.get("name"),
                "reviewer": r.get("reviewer", {}).get("displayName", "Anónimo"),
                "starRating": r.get("starRating", ""),
                "comment": r.get("comment", {}).get("text", ""),
                "createTime": r.get("createTime", ""),
                "updateTime": r.get("updateTime", ""),
                "reviewReply": r.get("reviewReply", {}),
            })
        return json.dumps(
            {"count": len(review_list), "reviews": review_list},
            indent=2,
            ensure_ascii=False,
        )
    except Exception as e:
        return json.dumps({"error": str(e)}, indent=2)


@mcp.tool(
    name="reply_to_review",
    description="Responder a una reseña de cliente (o actualizar una respuesta existente)",
)
def reply_to_review(review_name: str, reply_text: str) -> str:
    """Publica o actualiza una respuesta en una reseña."""
    try:
        api = build_service("mybusinessaccountmanagement")
        result = (
            api.accounts()
            .locations()
            .reviews()
            .updateReply(name=review_name, body={"comment": {"text": reply_text}})
            .execute()
        )
        return json.dumps({"success": True, "reply": result}, indent=2, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": str(e)}, indent=2)


@mcp.tool(
    name="delete_review_reply",
    description="Eliminar una respuesta existente a una reseña",
)
def delete_review_reply(review_name: str) -> str:
    """Elimina una respuesta publicada en una reseña."""
    try:
        api = build_service("mybusinessaccountmanagement")
        api.accounts().locations().reviews().deleteReply(name=review_name).execute()
        return json.dumps({"success": True}, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)}, indent=2)


@mcp.tool(
    name="create_post",
    description="Crear una publicación en Google Business Profile (oferta, evento, noticia o producto)",
)
def create_post(
    location_name: str,
    summary: str = "",
    post_type: str = "WHATSNEW",
    call_to_action_type: str = "",
    call_to_action_url: str = "",
) -> str:
    """Crea una publicación. post_type: WHATSNEW, EVENT, OFFER, PRODUCT"""
    try:
        api = build_service("mybusinessaccountmanagement")
        body = {
            "summary": {"text": summary},
            "topicType": "STANDARD",
        }
        if call_to_action_type and call_to_action_url:
            body["callToAction"] = {
                "actionType": call_to_action_type,
                "url": call_to_action_url,
            }
        result = (
            api.accounts()
            .locations()
            .localPosts()
            .create(parent=location_name, body=body)
            .execute()
        )
        return json.dumps({"success": True, "post": result}, indent=2, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": str(e)}, indent=2)


@mcp.tool(
    name="delete_post",
    description="Eliminar una publicación de Google Business Profile",
)
def delete_post(location_name: str, post_id: str) -> str:
    """Elimina una publicación."""
    try:
        api = build_service("mybusinessaccountmanagement")
        (
            api.accounts()
            .locations()
            .localPosts()
            .delete(parent=location_name, postId=post_id)
            .execute()
        )
        return json.dumps({"success": True}, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)}, indent=2)


@mcp.tool(
    name="get_insights",
    description="Obtener métricas de rendimiento (vistas, búsquedas, acciones) de una ubicación",
)
def get_insights(location_name: str, days_back: int = 30) -> str:
    """Obtiene métricas recientes de una ubicación."""
    try:
        api = build_service("mybusinessaccountmanagement")
        end = datetime.utcnow().isoformat() + "Z"
        start = (datetime.utcnow() - timedelta(days=days_back)).isoformat() + "Z"

        result = (
            api.accounts()
            .locations()
            .reportInsights(
                name=location_name,
                body={
                    "timeRange": {"startTime": start, "endTime": end},
                    "metrics": [
                        "QUERIES_DIRECT", "QUERIES_INDIRECT",
                        "VIEWS_MAPS", "VIEWS_SEARCH",
                        "ACTIONS_WEBSITE", "ACTIONS_PHONE",
                        "ACTIONS_DRIVING_DIRECTIONS",
                        "PHOTOS_VIEWS_COUNT",
                        "LOCAL_POST_VIEWS_COUNT",
                    ],
                },
            )
            .execute()
        )
        return json.dumps(result, indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return json.dumps({"error": str(e)}, indent=2)


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    mcp.run()
