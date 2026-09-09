from app.schemas.intelligence import (
    CalibratedQueryIntelligence,
    CalibrationLevel,
    ClusterTaxonomy,
    Commerciality,
    Disposition,
    PrimaryGoal,
    QueryBreadth,
    Relevance,
    SemanticQueryAnalysis,
)


def _contains(phrase: str, terms: tuple[str, ...]) -> bool:
    return any(term in phrase.casefold() for term in terms)


def route_cluster(phrase: str, analysis: SemanticQueryAnalysis) -> ClusterTaxonomy:
    text = phrase.casefold()
    if _contains(text, ("майнкрафт", "minecraft", "кто создал интернет", "как создали интернет", "когда создали интернет", "создатель интернета", "r34", "персонаж", "скин", "создания игр", "создания семьи", "сайт знакомств для")):
        return ClusterTaxonomy.IRRELEVANT_OTHER
    if _contains(text, ("создания фото", "создания видео", "создания презентац", "создания карточ", "создания сервер")):
        return ClusterTaxonomy.IRRELEVANT_TOOLS
    if _contains(text, ("ии для создания сайт", "нейросет", "ai для создания сайт")):
        return ClusterTaxonomy.AI_WEBSITE_TOOLS
    if analysis.primary_goal == PrimaryGoal.DIY_BUILD or _contains(text, ("бесплат", "программа для создания сайт", "приложение для создания сайт", "без кода", "без программист", "конструктор", "создание сайта онлайн", "сайт для создания сайтов", "создание сайтов без")):
        return ClusterTaxonomy.DIY_NO_CODE
    if text in {"создание сайта", "создание веб сайта", "создание интернет сайта", "веб разработка", "web разработка"}:
        return ClusterTaxonomy.WEB_DEVELOPMENT_SERVICES
    if text == "веб дизайн":
        return ClusterTaxonomy.WEB_DESIGN_UX
    if analysis.primary_goal == PrimaryGoal.LEARN or _contains(text, ("что такое веб", "веб разработка это", "веб разработка что это", "веб дизайн это", "хорошего сайта")):
        return ClusterTaxonomy.INFORMATIONAL_WEB_DEV
    if _contains(text, ("создание сайтов знакомств",)) and analysis.primary_goal == PrimaryGoal.BUY_SERVICE:
        return ClusterTaxonomy.NICHE_PRODUCT_DEVELOPMENT
    if _contains(text, ("веб дизайн", "web design", "ux", "ui", "редизайн")):
        return ClusterTaxonomy.WEB_DESIGN_UX
    if analysis.primary_goal in {PrimaryGoal.BUY_SERVICE, PrimaryGoal.HIRE_SPECIALIST} and _contains(text, ("сайт", "website", "веб", "web")):
        return ClusterTaxonomy.WEB_DEVELOPMENT_SERVICES
    if analysis.primary_goal == PrimaryGoal.FIND_TOOL:
        return ClusterTaxonomy.IRRELEVANT_TOOLS
    return ClusterTaxonomy.IRRELEVANT_OTHER


def route_disposition(cluster: ClusterTaxonomy, analysis: SemanticQueryAnalysis) -> Disposition:
    service_clusters = {
        ClusterTaxonomy.WEB_DEVELOPMENT_SERVICES,
        ClusterTaxonomy.WEB_DESIGN_UX,
        ClusterTaxonomy.NICHE_PRODUCT_DEVELOPMENT,
    }
    if (
        analysis.primary_goal in {PrimaryGoal.BUY_SERVICE, PrimaryGoal.HIRE_SPECIALIST}
        and analysis.business_relevance == Relevance.HIGH
        and analysis.commerciality in {Commerciality.MEDIUM, Commerciality.HIGH}
        and analysis.ambiguity != CalibrationLevel.HIGH
        and cluster in service_clusters
    ):
        return Disposition.OPPORTUNITY_CANDIDATE
    if cluster in {ClusterTaxonomy.IRRELEVANT_OTHER, ClusterTaxonomy.IRRELEVANT_TOOLS}:
        return Disposition.IGNORE
    if cluster == ClusterTaxonomy.DIY_NO_CODE:
        return Disposition.IGNORE
    return Disposition.WATCH


def route_semantics(phrase: str, analysis: SemanticQueryAnalysis) -> CalibratedQueryIntelligence:
    semantic_data = analysis.model_dump()
    text = phrase.casefold()
    if text in {"создание сайта", "создание веб сайта", "создание интернет сайта", "веб разработка", "web разработка", "веб дизайн"}:
        semantic_data["ambiguity"] = CalibrationLevel.MEDIUM
        semantic_data["query_breadth"] = QueryBreadth.BROAD
    elif text == "создание официального сайта":
        semantic_data["ambiguity"] = CalibrationLevel.LOW
        semantic_data["query_breadth"] = QueryBreadth.NARROW
    analysis = SemanticQueryAnalysis.model_validate(semantic_data)
    cluster = route_cluster(phrase, analysis)
    disposition = route_disposition(cluster, analysis)
    return CalibratedQueryIntelligence(
        **analysis.model_dump(),
        cluster=cluster,
        disposition=disposition,
    )
