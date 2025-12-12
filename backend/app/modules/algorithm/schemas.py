from pydantic import BaseModel


class AlgorithmSummary(BaseModel):
    objective: str
    status: str
    version: str


class AlgorithmLogEntry(BaseModel):
    id: int
    level: str
    message: str
    timestamp: str
