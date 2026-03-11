from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
import app.models  # noqa: F401 — ensures models are registered before create_all
from app.routers.auth import router as auth_router
from app.routers.jenkins import router as jenkins_router
from app.routers.permissions import router as permissions_router
from app.routers.trigger_history import router as trigger_history_router
from app.routers.users import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Jenkins Auth API", lifespan=lifespan)

# CORS must be added before routers so headers apply to error responses
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(permissions_router)
app.include_router(trigger_history_router)
app.include_router(jenkins_router)


@app.get("/")
def health_check():
    return {"status": "ok"}
