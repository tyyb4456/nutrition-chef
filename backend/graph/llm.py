"""Chat-model factory for the KapraOS AI layer.

The model is served through xKiro, an OpenAI-compatible gateway, so the
regular ``langchain-openai`` chat model is pointed at xKiro with two
settings: base URL + API key (per xKiro's own OpenAI-SDK guide). The key
is read from :class:`app.ai.config.AISettings` (``XKIRO_API_KEY`` in
``backend/.env``) — constructing the client performs no network I/O, so
this module is safe to import and unit-test offline.
"""

from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
load_dotenv()  # Load .env file for local development

import os

xkiro_model = "mistralai/mistral-large-2512"
xkiro_base_url = "https://api.xkiro.ai/v1"
xkiro_api_key = os.environ.get("XKIRO_API_KEY")


def build_xkiro_llm() -> ChatOpenAI:
    """Build the xKiro-backed chat model from settings.

    Raises :class:`MissingXKiroKeyError` when no key is configured, with
    instructions instead of a cryptic auth failure at invoke time.
    """
    return ChatOpenAI(
        model=xkiro_model,
        api_key=xkiro_api_key,
        base_url=xkiro_base_url,
    )
