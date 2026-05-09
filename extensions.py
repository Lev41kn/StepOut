# -*- coding: utf-8 -*-
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Створюємо лімітер ТУТ, але поки не прив'язуємо його до app
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)