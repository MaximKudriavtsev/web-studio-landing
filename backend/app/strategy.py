from app.intelligence.service_routing import Platform, ServiceLine

YANDEX_KIT_SEEDS = [
    "яндекс кит",
    "яндекс kit",
    "создание магазина яндекс кит",
    "настройка яндекс кит",
    "seo яндекс кит",
    "продвижение яндекс кит",
    "интернет магазин яндекс кит",
    "настройка seo яндекс kit",
]

YANDEX_KIT_HYPOTHESIS = {
    "title": "Создание, настройка и развитие интернет-магазинов на Яндекс KIT",
    "service_line": ServiceLine.ECOMMERCE.value,
    "platform": Platform.YANDEX_KIT.value,
    "hypothesis_type": "STRATEGIC_DIRECTION",
    "status": "RESEARCH_REQUIRED",
    "rationale": "Strategic service direction awaiting a separately approved controlled market scan.",
    "evidence_status": "NOT_RESEARCHED",
}
