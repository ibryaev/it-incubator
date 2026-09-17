from __future__ import annotations
from enum import Enum


class UserSpec(str, Enum):
    frontend: str = 'frontend'
    backend: str = "backend"
    fullstack: str = "fullstack"
    analytic: str = "analytic"
    tester: str = "tester"
    designer: str = "designer"
    devops: str = "devops"
    other: str = "other"
