from __future__ import annotations
from enum import Enum


class UserSpec(str, Enum):
    FRONTEND: str = 'frontend'
    BACKEND = "backend"
    FULLSTACK = "fullstack"
    ANALYTIC = "analytic"
    TESTER = "tester"
    DESIGNER = "designer"
    DEVOPS = "devops"
    OTHER = "other"
