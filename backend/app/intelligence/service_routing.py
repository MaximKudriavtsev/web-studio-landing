from enum import Enum


class ServiceLine(str, Enum):
    GENERAL_WEBSITE = "GENERAL_WEBSITE"
    CORPORATE_WEBSITE = "CORPORATE_WEBSITE"
    ECOMMERCE = "ECOMMERCE"
    WEB_APPLICATION = "WEB_APPLICATION"
    PERSONAL_ACCOUNT = "PERSONAL_ACCOUNT"
    BUSINESS_AUTOMATION = "BUSINESS_AUTOMATION"
    UX_UI = "UX_UI"
    REDESIGN = "REDESIGN"
    OTHER = "OTHER"


class Platform(str, Enum):
    YANDEX_KIT = "YANDEX_KIT"
    BITRIX = "BITRIX"
    TILDA = "TILDA"
    WORDPRESS = "WORDPRESS"
    CUSTOM = "CUSTOM"
    UNSPECIFIED = "UNSPECIFIED"
    OTHER = "OTHER"


def route_service_line(phrase: str, cluster: str) -> ServiceLine:
    text = " ".join(phrase.casefold().replace("ё", "е").split())
    if any(term in text for term in ("личн кабинет", "личного кабинет", "личный кабинет")):
        return ServiceLine.PERSONAL_ACCOUNT
    if any(term in text for term in ("интернет магазин", "интернет-магазин", "ecommerce", "e-commerce")):
        return ServiceLine.ECOMMERCE
    if any(term in text for term in ("корпоративн", "сайт компании", "сайт для компании")):
        return ServiceLine.CORPORATE_WEBSITE
    if any(term in text for term in ("веб прилож", "web app", "веб-сервис", "веб сервис")):
        return ServiceLine.WEB_APPLICATION
    if any(term in text for term in ("автоматизац", "crm", "erp", "бизнес процесс")):
        return ServiceLine.BUSINESS_AUTOMATION
    if any(term in text for term in ("редизайн", "доработка сайта", "развитие сайта")):
        return ServiceLine.REDESIGN
    if any(term in text for term in ("ux", "ui", "веб дизайн", "web design", "дизайн интерфейс")):
        return ServiceLine.UX_UI
    if cluster == "WEB_DEVELOPMENT_SERVICES" and any(term in text for term in ("сайт", "website", "веб разработ")):
        return ServiceLine.GENERAL_WEBSITE
    return ServiceLine.OTHER


def route_platform(phrase: str) -> Platform:
    text = phrase.casefold().replace("ё", "е")
    if "яндекс кит" in text or "yandex kit" in text:
        return Platform.YANDEX_KIT
    if "битрикс" in text or "bitrix" in text:
        return Platform.BITRIX
    if "тильд" in text or "tilda" in text:
        return Platform.TILDA
    if "wordpress" in text or "вордпресс" in text:
        return Platform.WORDPRESS
    if any(term in text for term in ("кастом", "индивидуальн разработ", "с нуля")):
        return Platform.CUSTOM
    return Platform.UNSPECIFIED


def route_service_dimensions(phrase: str, cluster: str) -> tuple[ServiceLine, Platform]:
    return route_service_line(phrase, cluster), route_platform(phrase)
