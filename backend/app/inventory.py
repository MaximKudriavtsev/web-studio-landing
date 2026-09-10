import re
from pathlib import Path
from app.schemas.opportunities import SitePageInventory

SITE_CONTENT=Path(__file__).resolve().parents[2]/"src"/"content"/"site.ts"
TOPICS={"Сайты для бизнеса":["website development","corporate/business websites"],"Приложения и кабинеты":["web applications / personal accounts"],"UX/UI и дизайн-системы":["UX/UI"],"Редизайн и развитие":["redesign","promotion/development"]}

def build_site_inventory(path:Path=SITE_CONTENT)->list[SitePageInventory]:
 text=path.read_text(encoding="utf-8"); section=text.split("services: [",1)[1].split("cases: [",1)[0]
 items=[]
 for block in re.findall(r"\{\s*id: '([^']+)'(.*?)\n\s*\},",section,re.S):
  service_id,body=block; title=re.search(r"title: '([^']+)'",body); description=re.search(r"text: '([^']+)'",body); features=re.search(r"features: \[([^]]+)\]",body)
  if not title or not description: continue
  name=title.group(1); offered=re.findall(r"'([^']+)'",features.group(1)) if features else []
  items.append(SitePageInventory(url=f"/#services-{service_id}",page_type="service_section",title=name,h1="Делаем digital, который делает дело.",description=description.group(1),business_topics=TOPICS.get(name,[]),offered_services=offered,target_intents=["BUY_SERVICE"],source_file="src/content/site.ts",active=True))
 return items
