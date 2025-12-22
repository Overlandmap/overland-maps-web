'use client'

import { useEffect, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslatedLabel } from '../lib/i18n'

interface LegendExplanationPopupProps {
  isOpen: boolean
  onClose: () => void
  category: 'overlanding' | 'carnet' | 'borders' | 'border_posts' | 'zones' | null
}

// Explanation texts for overlanding statuses
const OVERLANDING_EXPLANATIONS = {
  open: {
    en: "Travel with a vehicle is open and without restriction. You only need a temporary import permit or a Carnet de Passage for the car and usually an insurance (see detail by clicking on the country).",
    fr: "Les voyages avec un véhicule sont ouverts et sans restriction. Vous n'avez besoin que d'un permis d'importation temporaire ou d'un Carnet de Passage pour la voiture et généralement d'une assurance (voir les détails en cliquant sur le pays).",
    de: "Reisen mit einem Fahrzeug ist offen und ohne Einschränkungen. Sie benötigen nur eine temporäre Einfuhrgenehmigung oder ein Carnet de Passage für das Auto und normalerweise eine Versicherung (Details siehe durch Klicken auf das Land).",
    es: "Viajar con un vehículo está abierto y sin restricciones. Solo necesitas un permiso de importación temporal o un Carnet de Passage para el coche y normalmente un seguro (ver detalles haciendo clic en el país).",
    it: "Viaggiare con un veicolo è aperto e senza restrizioni. Hai bisogno solo di un permesso di importazione temporaneo o di un Carnet de Passage per l'auto e solitamente di un'assicurazione (vedi i dettagli cliccando sul paese).",
    ru: "Путешествие на автомобиле открыто и без ограничений. Вам нужно только временное разрешение на ввоз или Carnet de Passage для автомобиля и обычно страховка (подробности см., нажав на страну).",
    nl: "Reizen met een voertuig is open en zonder beperkingen. Je hebt alleen een tijdelijke invoervergunning of een Carnet de Passage voor de auto nodig en meestal een verzekering (zie details door op het land te klikken).",
    ja: "車両での旅行は開放されており、制限はありません。車の一時輸入許可証またはCarnet de Passageと通常は保険が必要です（詳細は国をクリックしてください）。",
    zh: "车辆旅行是开放的，没有限制。您只需要汽车的临时进口许可证或Carnet de Passage，通常还需要保险（详情请点击国家查看）。"
  },
  restricted_access: {
    en: "It's possible to visit the country with their own vehicle, but there are some major hurdles to bringing a vehicle in, such as a special permit or a mandatory guide. Refer to the comments of the country for the details.",
    fr: "Il est possible de visiter le pays avec son propre véhicule, mais il y a des obstacles majeurs pour faire entrer un véhicule, comme un permis spécial ou un guide obligatoire. Consultez les commentaires du pays pour les détails.",
    de: "Es ist möglich, das Land mit dem eigenen Fahrzeug zu besuchen, aber es gibt große Hürden beim Einbringen eines Fahrzeugs, wie eine spezielle Genehmigung oder einen obligatorischen Führer. Siehe die Kommentare des Landes für Details.",
    es: "Es posible visitar el país con su propio vehículo, pero hay obstáculos importantes para traer un vehículo, como un permiso especial o un guía obligatorio. Consulte los comentarios del país para obtener detalles.",
    it: "È possibile visitare il paese con il proprio veicolo, ma ci sono ostacoli importanti per portare un veicolo, come un permesso speciale o una guida obbligatoria. Fare riferimento ai commenti del paese per i dettagli.",
    ru: "Можно посетить страну на собственном автомобиле, но есть серьезные препятствия для ввоза транспортного средства, такие как специальное разрешение или обязательный гид. Обратитесь к комментариям страны за подробностями.",
    nl: "Het is mogelijk om het land te bezoeken met je eigen voertuig, maar er zijn grote obstakels voor het binnenbrengen van een voertuig, zoals een speciale vergunning of een verplichte gids. Raadpleeg de opmerkingen van het land voor details.",
    ja: "自分の車両でその国を訪問することは可能ですが、特別な許可証や義務的なガイドなど、車両を持ち込むための大きな障害があります。詳細については国のコメントを参照してください。",
    zh: "可以用自己的车辆访问该国，但在带入车辆方面存在一些重大障碍，如特殊许可证或强制性向导。详情请参考国家评论。"
  },
  war_dangerous: {
    en: "The country is either in a state of war or the security situation is such that it is unwise to overland there. While it may not be impossible to enter, you do it at your own risk and usually without any help from your embassy.",
    fr: "Le pays est soit en état de guerre, soit la situation sécuritaire est telle qu'il est imprudent d'y voyager par voie terrestre. Bien qu'il ne soit peut-être pas impossible d'entrer, vous le faites à vos propres risques et généralement sans aide de votre ambassade.",
    de: "Das Land befindet sich entweder im Kriegszustand oder die Sicherheitslage ist so, dass es unklug ist, dort zu reisen. Obwohl es vielleicht nicht unmöglich ist einzureisen, tun Sie es auf eigenes Risiko und normalerweise ohne Hilfe Ihrer Botschaft.",
    es: "El país está en estado de guerra o la situación de seguridad es tal que no es aconsejable viajar por tierra allí. Aunque puede que no sea imposible entrar, lo haces bajo tu propio riesgo y generalmente sin ayuda de tu embajada.",
    it: "Il paese è in stato di guerra o la situazione di sicurezza è tale che è sconsigliabile viaggiare via terra lì. Anche se potrebbe non essere impossibile entrare, lo fai a tuo rischio e di solito senza aiuto dalla tua ambasciata.",
    ru: "Страна либо находится в состоянии войны, либо ситуация с безопасностью такова, что неразумно путешествовать там по суше. Хотя въезд может быть не невозможен, вы делаете это на свой страх и риск и обычно без помощи вашего посольства.",
    nl: "Het land is ofwel in oorlog of de veiligheidssituatie is zodanig dat het onverstandig is om daar over land te reizen. Hoewel het misschien niet onmogelijk is om binnen te komen, doe je het op eigen risico en meestal zonder hulp van je ambassade.",
    ja: "その国は戦争状態にあるか、治安状況がオーバーランドするには不適切です。入国が不可能ではないかもしれませんが、自己責任で行い、通常は大使館からの支援もありません。",
    zh: "该国要么处于战争状态，要么安全局势使得在那里进行陆路旅行是不明智的。虽然进入可能不是不可能的，但您需要自担风险，通常没有大使馆的帮助。"
  },
  forbidden: {
    en: "Entering the country with a foreign vehicle is completely forbidden - although bicycles are usually allowed. It may or may not be possible to rent a car from within the country.",
    fr: "L'entrée dans le pays avec un véhicule étranger est complètement interdite - bien que les vélos soient généralement autorisés. Il peut être possible ou non de louer une voiture dans le pays.",
    de: "Die Einreise in das Land mit einem ausländischen Fahrzeug ist völlig verboten - obwohl Fahrräder normalerweise erlaubt sind. Es kann möglich sein oder nicht, ein Auto im Land zu mieten.",
    es: "Entrar al país con un vehículo extranjero está completamente prohibido, aunque las bicicletas generalmente están permitidas. Puede ser posible o no alquilar un coche dentro del país.",
    it: "Entrare nel paese con un veicolo straniero è completamente vietato - anche se le biciclette sono solitamente permesse. Potrebbe essere possibile o meno noleggiare un'auto all'interno del paese.",
    ru: "Въезд в страну на иностранном транспортном средстве полностью запрещен - хотя велосипеды обычно разрешены. Возможно или нет арендовать автомобиль внутри страны.",
    nl: "Het binnenkomen van het land met een buitenlands voertuig is volledig verboden - hoewel fietsen meestal wel toegestaan zijn. Het kan wel of niet mogelijk zijn om een auto te huren binnen het land.",
    ja: "外国車両での入国は完全に禁止されています - ただし、自転車は通常許可されています。国内でレンタカーを借りることが可能かどうかは分かりません。",
    zh: "完全禁止外国车辆进入该国 - 尽管自行车通常是允许的。在国内租车可能可行也可能不可行。"
  }
}

// Explanation texts for carnet statuses
const CARNET_EXPLANATIONS = {
  not_required: {
    en: "A Carnet de Passage is not required for this country. You can typically enter with a temporary import permit or other standard documentation.",
    fr: "Un Carnet de Passage n'est pas requis pour ce pays. Vous pouvez généralement entrer avec un permis d'importation temporaire ou d'autres documents standard.",
    de: "Ein Carnet de Passage ist für dieses Land nicht erforderlich. Sie können normalerweise mit einer temporären Einfuhrgenehmigung oder anderen Standarddokumenten einreisen.",
    es: "No se requiere un Carnet de Passage para este país. Normalmente puedes entrar con un permiso de importación temporal u otra documentación estándar.",
    it: "Un Carnet de Passage non è richiesto per questo paese. Puoi tipicamente entrare con un permesso di importazione temporaneo o altra documentazione standard.",
    ru: "Carnet de Passage не требуется для этой страны. Обычно вы можете въехать с временным разрешением на ввоз или другими стандартными документами.",
    nl: "Een Carnet de Passage is niet vereist voor dit land. Je kunt meestal binnenkomen met een tijdelijke invoervergunning of andere standaarddocumentatie.",
    ja: "この国ではCarnet de Passageは必要ありません。通常、一時輸入許可証やその他の標準的な書類で入国できます。",
    zh: "这个国家不需要Carnet de Passage。您通常可以使用临时进口许可证或其他标准文件进入。"
  },
  required_in_some_situations: {
    en: "A Carnet de Passage may be required in certain situations or for certain types of vehicles. Check the country details for specific requirements.",
    fr: "Un Carnet de Passage peut être requis dans certaines situations ou pour certains types de véhicules. Vérifiez les détails du pays pour les exigences spécifiques.",
    de: "Ein Carnet de Passage kann in bestimmten Situationen oder für bestimmte Fahrzeugtypen erforderlich sein. Überprüfen Sie die Länderdetails für spezifische Anforderungen.",
    es: "Un Carnet de Passage puede ser requerido en ciertas situaciones o para ciertos tipos de vehículos. Consulte los detalles del país para requisitos específicos.",
    it: "Un Carnet de Passage potrebbe essere richiesto in certe situazioni o per certi tipi di veicoli. Controlla i dettagli del paese per requisiti specifici.",
    ru: "Carnet de Passage может потребоваться в определенных ситуациях или для определенных типов транспортных средств. Проверьте детали страны для конкретных требований.",
    nl: "Een Carnet de Passage kan vereist zijn in bepaalde situaties of voor bepaalde voertuigtypes. Controleer de landdetails voor specifieke vereisten.",
    ja: "特定の状況や特定の車両タイプでCarnet de Passageが必要な場合があります。具体的な要件については国の詳細を確認してください。",
    zh: "在某些情况下或对某些类型的车辆可能需要Carnet de Passage。请查看国家详情了解具体要求。"
  },
  mandatory: {
    en: "A Carnet de Passage is mandatory for entering this country with a vehicle. This document serves as a customs guarantee and must be obtained before travel.",
    fr: "Un Carnet de Passage est obligatoire pour entrer dans ce pays avec un véhicule. Ce document sert de garantie douanière et doit être obtenu avant le voyage.",
    de: "Ein Carnet de Passage ist obligatorisch für die Einreise in dieses Land mit einem Fahrzeug. Dieses Dokument dient als Zollgarantie und muss vor der Reise erhalten werden.",
    es: "Un Carnet de Passage es obligatorio para entrar a este país con un vehículo. Este documento sirve como garantía aduanera y debe obtenerse antes del viaje.",
    it: "Un Carnet de Passage è obbligatorio per entrare in questo paese con un veicolo. Questo documento serve come garanzia doganale e deve essere ottenuto prima del viaggio.",
    ru: "Carnet de Passage обязателен для въезда в эту страну с транспортным средством. Этот документ служит таможенной гарантией и должен быть получен до поездки.",
    nl: "Een Carnet de Passage is verplicht voor het binnenkomen van dit land met een voertuig. Dit document dient als douanegarantie en moet voor de reis worden verkregen.",
    ja: "この国に車両で入国するにはCarnet de Passageが必須です。この書類は税関保証として機能し、旅行前に取得する必要があります。",
    zh: "进入这个国家必须有Carnet de Passage。该文件作为海关担保，必须在旅行前获得。"
  },
  access_forbidden: {
    en: "Vehicle access is completely forbidden for foreign vehicles. Entry with personal vehicles is not permitted under any circumstances.",
    fr: "L'accès des véhicules est complètement interdit pour les véhicules étrangers. L'entrée avec des véhicules personnels n'est pas autorisée en aucune circonstance.",
    de: "Der Fahrzeugzugang ist für ausländische Fahrzeuge vollständig verboten. Die Einreise mit Privatfahrzeugen ist unter keinen Umständen gestattet.",
    es: "El acceso de vehículos está completamente prohibido para vehículos extranjeros. La entrada con vehículos personales no está permitida bajo ninguna circunstancia.",
    it: "L'accesso dei veicoli è completamente vietato per i veicoli stranieri. L'ingresso con veicoli personali non è permesso in nessuna circostanza.",
    ru: "Доступ транспортных средств полностью запрещен для иностранных транспортных средств. Въезд на личных транспортных средствах не разрешен ни при каких обстоятельствах.",
    nl: "Voertuigtoegang is volledig verboden voor buitenlandse voertuigen. Toegang met persoonlijke voertuigen is onder geen enkele omstandigheid toegestaan.",
    ja: "外国車両の車両アクセスは完全に禁止されています。個人車両での入国はいかなる状況でも許可されていません。",
    zh: "外国车辆完全禁止进入。在任何情况下都不允许使用个人车辆进入。"
  }
}

// Explanation texts for border statuses
const BORDER_EXPLANATIONS = {
  open: {
    en: "The border can be crossed at the designated border posts.",
    fr: "La frontière peut être franchie aux postes frontières désignés.",
    de: "Die Grenze kann an den ausgewiesenen Grenzübergängen überquert werden.",
    es: "La frontera puede cruzarse en los puestos fronterizos designados.",
    it: "Il confine può essere attraversato presso i posti di frontiera designati.",
    ru: "Границу можно пересечь на обозначенных пограничных пунктах.",
    nl: "De grens kan worden overgestoken bij de aangewezen grensposten.",
    ja: "指定された国境検問所で国境を越えることができます。",
    zh: "可以在指定的边境哨所过境。"
  },
  restricted: {
    en: "Some category of people or vehicles are not allowed to cross, see the comments.",
    fr: "Certaines catégories de personnes ou de véhicules ne sont pas autorisées à traverser, voir les commentaires.",
    de: "Bestimmte Kategorien von Personen oder Fahrzeugen dürfen nicht überqueren, siehe Kommentare.",
    es: "Algunas categorías de personas o vehículos no pueden cruzar, ver los comentarios.",
    it: "Alcune categorie di persone o veicoli non sono autorizzate ad attraversare, vedere i commenti.",
    ru: "Некоторым категориям людей или транспортных средств не разрешается пересекать границу, см. комментарии.",
    nl: "Sommige categorieën mensen of voertuigen mogen niet oversteken, zie de opmerkingen.",
    ja: "一部のカテゴリーの人や車両は通過が許可されていません。コメントを参照してください。",
    zh: "某些类别的人员或车辆不允许通过，请查看评论。"
  },
  closed: {
    en: "The border is completely closed to all tourists, at all border posts, although some very limited local traffic may be allowed.",
    fr: "La frontière est complètement fermée à tous les touristes, à tous les postes frontières, bien qu'un trafic local très limité puisse être autorisé.",
    de: "Die Grenze ist für alle Touristen an allen Grenzübergängen vollständig geschlossen, obwohl sehr begrenzter lokaler Verkehr erlaubt sein kann.",
    es: "La frontera está completamente cerrada a todos los turistas, en todos los puestos fronterizos, aunque puede permitirse un tráfico local muy limitado.",
    it: "Il confine è completamente chiuso a tutti i turisti, in tutti i posti di frontiera, anche se può essere consentito un traffico locale molto limitato.",
    ru: "Граница полностью закрыта для всех туристов на всех пограничных пунктах, хотя может быть разрешено очень ограниченное местное движение.",
    nl: "De grens is volledig gesloten voor alle toeristen, bij alle grensposten, hoewel zeer beperkt lokaal verkeer toegestaan kan zijn.",
    ja: "国境はすべての観光客に対して、すべての国境検問所で完全に閉鎖されていますが、非常に限定的な地域交通は許可される場合があります。",
    zh: "边境对所有游客完全关闭，在所有边境哨所都是如此，尽管可能允许一些非常有限的当地交通。"
  }
}

// Explanation texts for border post statuses
const BORDER_POST_EXPLANATIONS = {
  open: {
    en: "The border post allows anybody to cross from one country to another, provided they have the proper documents / visa / permit.",
    fr: "Le poste frontière permet à quiconque de passer d'un pays à l'autre, à condition d'avoir les documents / visa / permis appropriés.",
    de: "Der Grenzübergang erlaubt jedem, von einem Land in ein anderes zu wechseln, vorausgesetzt, sie haben die entsprechenden Dokumente / Visa / Genehmigungen.",
    es: "El puesto fronterizo permite a cualquiera cruzar de un país a otro, siempre que tengan los documentos / visa / permiso apropiados.",
    it: "Il posto di frontiera consente a chiunque di attraversare da un paese all'altro, purché abbiano i documenti / visto / permesso appropriati.",
    ru: "Пограничный пункт позволяет любому пересекать границу из одной страны в другую, при условии наличия соответствующих документов / визы / разрешения.",
    nl: "De grenspost staat iedereen toe om van het ene land naar het andere over te steken, mits ze de juiste documenten / visum / vergunning hebben.",
    ja: "国境検問所では、適切な書類/ビザ/許可証を持っていれば、誰でも一国から他国へ渡ることができます。",
    zh: "边境哨所允许任何人从一个国家过境到另一个国家，前提是他们有适当的文件/签证/许可证。"
  },
  bilateral: {
    en: "Only nationals from the two border countries can cross. Tourists are not allowed.",
    fr: "Seuls les ressortissants des deux pays frontaliers peuvent traverser. Les touristes ne sont pas autorisés.",
    de: "Nur Staatsangehörige der beiden Grenzländer können überqueren. Touristen sind nicht erlaubt.",
    es: "Solo los nacionales de los dos países fronterizos pueden cruzar. Los turistas no están permitidos.",
    it: "Solo i cittadini dei due paesi di confine possono attraversare. I turisti non sono ammessi.",
    ru: "Только граждане двух приграничных стран могут пересекать границу. Туристы не допускаются.",
    nl: "Alleen onderdanen van de twee grenslanden mogen oversteken. Toeristen zijn niet toegestaan.",
    ja: "国境を接する2つの国の国民のみが通過できます。観光客は許可されていません。",
    zh: "只有两个边境国家的国民可以通过。不允许游客通过。"
  },
  restricted: {
    en: "Read the comments to figure out if you can cross. For example, only pedestrian traffic is allowed, or only in one direction.",
    fr: "Lisez les commentaires pour savoir si vous pouvez traverser. Par exemple, seul le trafic piétonnier est autorisé, ou seulement dans une direction.",
    de: "Lesen Sie die Kommentare, um herauszufinden, ob Sie überqueren können. Zum Beispiel ist nur Fußgängerverkehr erlaubt oder nur in eine Richtung.",
    es: "Lea los comentarios para averiguar si puede cruzar. Por ejemplo, solo se permite tráfico peatonal, o solo en una dirección.",
    it: "Leggi i commenti per capire se puoi attraversare. Ad esempio, è consentito solo il traffico pedonale, o solo in una direzione.",
    ru: "Прочитайте комментарии, чтобы выяснить, можете ли вы пересечь границу. Например, разрешено только пешеходное движение или только в одном направлении.",
    nl: "Lees de opmerkingen om erachter te komen of je kunt oversteken. Bijvoorbeeld, alleen voetgangersverkeer is toegestaan, of alleen in één richting.",
    ja: "通過できるかどうかはコメントを読んで確認してください。例えば、歩行者のみ許可されている、または一方向のみなどです。",
    zh: "阅读评论以了解您是否可以通过。例如，只允许行人通行，或只允许单向通行。"
  },
  closed: {
    en: "There is a designated border post, but it is closed to all traffic.",
    fr: "Il y a un poste frontière désigné, mais il est fermé à tout trafic.",
    de: "Es gibt einen ausgewiesenen Grenzübergang, aber er ist für den gesamten Verkehr geschlossen.",
    es: "Hay un puesto fronterizo designado, pero está cerrado a todo tráfico.",
    it: "C'è un posto di frontiera designato, ma è chiuso a tutto il traffico.",
    ru: "Есть обозначенный пограничный пункт, но он закрыт для всего движения.",
    nl: "Er is een aangewezen grenspost, maar deze is gesloten voor al het verkeer.",
    ja: "指定された国境検問所がありますが、すべての交通に対して閉鎖されています。",
    zh: "有一个指定的边境哨所，但对所有交通都关闭。"
  }
}

// Explanation texts for zone statuses
const ZONE_EXPLANATIONS = {
  closed: {
    en: "It is forbidden to visit this area.",
    fr: "Il est interdit de visiter cette zone.",
    de: "Es ist verboten, dieses Gebiet zu besuchen.",
    es: "Está prohibido visitar esta área.",
    it: "È vietato visitare questa area.",
    ru: "Запрещено посещать эту территорию.",
    nl: "Het is verboden om dit gebied te bezoeken.",
    ja: "このエリアを訪問することは禁止されています。",
    zh: "禁止访问此区域。"
  },
  guide_escort: {
    en: "One can cross this area, but only with an official guide and/or a police or military escort.",
    fr: "On peut traverser cette zone, mais seulement avec un guide officiel et/ou une escorte policière ou militaire.",
    de: "Man kann dieses Gebiet durchqueren, aber nur mit einem offiziellen Führer und/oder einer Polizei- oder Militäreskorte.",
    es: "Se puede cruzar esta área, pero solo con un guía oficial y/o una escolta policial o militar.",
    it: "Si può attraversare questa area, ma solo con una guida ufficiale e/o una scorta di polizia o militare.",
    ru: "Можно пересечь эту территорию, но только с официальным гидом и/или полицейским или военным сопровождением.",
    nl: "Men kan dit gebied doorkruisen, maar alleen met een officiële gids en/of een politie- of militaire escorte.",
    ja: "このエリアは通過できますが、公式ガイドおよび/または警察や軍の護衛が必要です。",
    zh: "可以穿越此区域，但只能在官方向导和/或警察或军事护送下进行。"
  },
  permit: {
    en: "The access is allowed to anybody, provided one has the proper permit (see comments on how to get it).",
    fr: "L'accès est autorisé à quiconque, à condition d'avoir le permis approprié (voir les commentaires sur la façon de l'obtenir).",
    de: "Der Zugang ist jedem gestattet, vorausgesetzt, man hat die entsprechende Genehmigung (siehe Kommentare, wie man sie erhält).",
    es: "El acceso está permitido a cualquiera, siempre que tenga el permiso adecuado (ver comentarios sobre cómo obtenerlo).",
    it: "L'accesso è consentito a chiunque, purché abbia il permesso appropriato (vedere i commenti su come ottenerlo).",
    ru: "Доступ разрешен всем, при условии наличия соответствующего разрешения (см. комментарии о том, как его получить).",
    nl: "Toegang is toegestaan voor iedereen, mits men de juiste vergunning heeft (zie opmerkingen over hoe deze te verkrijgen).",
    ja: "適切な許可証を持っていれば誰でもアクセスできます（取得方法についてはコメントを参照）。",
    zh: "任何人都可以进入，只要有适当的许可证（请参阅如何获得的评论）。"
  },
  restrictions: {
    en: "The area is not entirely open, see the comments for the details.",
    fr: "La zone n'est pas entièrement ouverte, voir les commentaires pour les détails.",
    de: "Das Gebiet ist nicht vollständig geöffnet, siehe Kommentare für Details.",
    es: "El área no está completamente abierta, ver los comentarios para los detalles.",
    it: "L'area non è completamente aperta, vedere i commenti per i dettagli.",
    ru: "Территория не полностью открыта, см. комментарии для подробностей.",
    nl: "Het gebied is niet volledig open, zie de opmerkingen voor details.",
    ja: "このエリアは完全に開放されていません。詳細はコメントを参照してください。",
    zh: "该区域并非完全开放，详情请查看评论。"
  }
}

export default function LegendExplanationPopup({ 
  isOpen, 
  onClose, 
  category
}: LegendExplanationPopupProps) {
  const { language } = useLanguage()
  const popupRef = useRef<HTMLDivElement>(null)

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Close popup on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !category) {
    return null
  }

  const getTitle = () => {
    if (category === 'overlanding') {
      return `${getTranslatedLabel('overlanding', language)} ${getTranslatedLabel('status_explanations', language) || 'Status Explanations'}`
    } else if (category === 'carnet') {
      return `${getTranslatedLabel('carnet', language)} ${getTranslatedLabel('requirements_explanations', language) || 'Requirements Explanations'}`
    } else if (category === 'borders') {
      return `${getTranslatedLabel('borders', language)} ${getTranslatedLabel('status_explanations', language) || 'Status Explanations'}`
    } else if (category === 'border_posts') {
      return `${getTranslatedLabel('border_posts', language)} ${getTranslatedLabel('status_explanations', language) || 'Status Explanations'}`
    } else if (category === 'zones') {
      return `${getTranslatedLabel('restricted_areas', language)} ${getTranslatedLabel('status_explanations', language) || 'Status Explanations'}`
    }
    return ''
  }

  const getAllExplanations = () => {
    if (category === 'overlanding') {
      return [
        {
          title: getTranslatedLabel('open', language),
          color: '#16a34a',
          text: OVERLANDING_EXPLANATIONS.open[language as keyof typeof OVERLANDING_EXPLANATIONS.open] || OVERLANDING_EXPLANATIONS.open.en
        },
        {
          title: getTranslatedLabel('restricted_access', language),
          color: '#eab308',
          text: OVERLANDING_EXPLANATIONS.restricted_access[language as keyof typeof OVERLANDING_EXPLANATIONS.restricted_access] || OVERLANDING_EXPLANATIONS.restricted_access.en
        },
        {
          title: getTranslatedLabel('war_dangerous', language),
          color: '#dc2626',
          text: OVERLANDING_EXPLANATIONS.war_dangerous[language as keyof typeof OVERLANDING_EXPLANATIONS.war_dangerous] || OVERLANDING_EXPLANATIONS.war_dangerous.en
        },
        {
          title: getTranslatedLabel('forbidden', language),
          color: '#1a1a1a',
          text: OVERLANDING_EXPLANATIONS.forbidden[language as keyof typeof OVERLANDING_EXPLANATIONS.forbidden] || OVERLANDING_EXPLANATIONS.forbidden.en
        }
      ]
    } else if (category === 'carnet') {
      return [
        {
          title: getTranslatedLabel('not_required', language),
          color: '#9ca3af',
          text: CARNET_EXPLANATIONS.not_required[language as keyof typeof CARNET_EXPLANATIONS.not_required] || CARNET_EXPLANATIONS.not_required.en
        },
        {
          title: getTranslatedLabel('required_in_some_situations', language),
          color: '#dc8dc7',
          text: CARNET_EXPLANATIONS.required_in_some_situations[language as keyof typeof CARNET_EXPLANATIONS.required_in_some_situations] || CARNET_EXPLANATIONS.required_in_some_situations.en
        },
        {
          title: getTranslatedLabel('mandatory', language),
          color: '#0c15c3',
          text: CARNET_EXPLANATIONS.mandatory[language as keyof typeof CARNET_EXPLANATIONS.mandatory] || CARNET_EXPLANATIONS.mandatory.en
        },
        {
          title: getTranslatedLabel('access_forbidden', language),
          color: '#000000',
          text: CARNET_EXPLANATIONS.access_forbidden[language as keyof typeof CARNET_EXPLANATIONS.access_forbidden] || CARNET_EXPLANATIONS.access_forbidden.en
        }
      ]
    } else if (category === 'borders') {
      return [
        {
          title: getTranslatedLabel('open', language),
          color: '#15803d',
          text: BORDER_EXPLANATIONS.open[language as keyof typeof BORDER_EXPLANATIONS.open] || BORDER_EXPLANATIONS.open.en
        },
        {
          title: getTranslatedLabel('restricted', language),
          color: '#eab308',
          text: BORDER_EXPLANATIONS.restricted[language as keyof typeof BORDER_EXPLANATIONS.restricted] || BORDER_EXPLANATIONS.restricted.en
        },
        {
          title: getTranslatedLabel('closed', language),
          color: '#ef4444',
          text: BORDER_EXPLANATIONS.closed[language as keyof typeof BORDER_EXPLANATIONS.closed] || BORDER_EXPLANATIONS.closed.en
        }
      ]
    } else if (category === 'border_posts') {
      return [
        {
          title: getTranslatedLabel('open', language),
          color: '#22c55e',
          text: BORDER_POST_EXPLANATIONS.open[language as keyof typeof BORDER_POST_EXPLANATIONS.open] || BORDER_POST_EXPLANATIONS.open.en
        },
        {
          title: getTranslatedLabel('bilateral', language),
          color: '#3b82f6',
          text: BORDER_POST_EXPLANATIONS.bilateral[language as keyof typeof BORDER_POST_EXPLANATIONS.bilateral] || BORDER_POST_EXPLANATIONS.bilateral.en
        },
        {
          title: getTranslatedLabel('restricted', language),
          color: '#eab308',
          text: BORDER_POST_EXPLANATIONS.restricted[language as keyof typeof BORDER_POST_EXPLANATIONS.restricted] || BORDER_POST_EXPLANATIONS.restricted.en
        },
        {
          title: getTranslatedLabel('closed', language),
          color: '#ef4444',
          text: BORDER_POST_EXPLANATIONS.closed[language as keyof typeof BORDER_POST_EXPLANATIONS.closed] || BORDER_POST_EXPLANATIONS.closed.en
        }
      ]
    } else if (category === 'zones') {
      return [
        {
          title: getTranslatedLabel('zone_closed', language),
          color: '#ef4444',
          text: ZONE_EXPLANATIONS.closed[language as keyof typeof ZONE_EXPLANATIONS.closed] || ZONE_EXPLANATIONS.closed.en
        },
        {
          title: getTranslatedLabel('zone_guide_escort', language),
          color: '#000000',
          text: ZONE_EXPLANATIONS.guide_escort[language as keyof typeof ZONE_EXPLANATIONS.guide_escort] || ZONE_EXPLANATIONS.guide_escort.en
        },
        {
          title: getTranslatedLabel('zone_permit', language),
          color: '#9ca3af',
          text: ZONE_EXPLANATIONS.permit[language as keyof typeof ZONE_EXPLANATIONS.permit] || ZONE_EXPLANATIONS.permit.en
        },
        {
          title: getTranslatedLabel('zone_restrictions', language),
          color: '#3b82f6',
          text: ZONE_EXPLANATIONS.restrictions[language as keyof typeof ZONE_EXPLANATIONS.restrictions] || ZONE_EXPLANATIONS.restrictions.en
        }
      ]
    }
    return []
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={popupRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {getTitle()}
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-6">
            {getAllExplanations().map((explanation, index) => (
              <div key={index} className="border-l-4 pl-4" style={{ borderColor: explanation.color }}>
                <div className="flex items-center mb-2">
                  <div 
                    className="w-4 h-4 rounded-sm mr-3" 
                    style={{ backgroundColor: explanation.color }}
                  ></div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {explanation.title}
                  </h4>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {explanation.text}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}