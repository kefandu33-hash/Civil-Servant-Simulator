/* ============================================================
   events.js —— 事件库
   规则：
   - 家庭事件必须 marital === "married"
   - 孩子事件必须 hasChild === true
   - 年龄相关加 cond
   - 红包加"家庭"值
   - 前三年有专属事件
   ============================================================ */

   const EVENTS = [

    /* ==================== 入职 ==================== */
    { id: "start", stage: "newbie", type: "stage", weight: 100, once: true,
      scene: "office",
      text: "报到那天，科长拍拍你肩膀：<span class='dialog'>年轻人，好好干。</span><br><span class='os'>（内心：我一定好好干！）</span>",
      choices: [
        { label: "点头，表态好好干", hint: "领导+ 心情+", effect: { leader: 3, mood: 2 } },
        { label: "谦虚地说还要多学习", hint: "能力+ 领导+", effect: { ability: 2, leader: 2 } },
        { label: "问什么时候能提拔", hint: "领导--", risky: true, effect: { leader: -6, mood: -2 } }
      ]
    },
    
    /* ==================== 第一年：适应期 ==================== */
    { id: "first_spring", stage: "newbie", type: "stage", weight: 100, once: true,
      cond: s => s.year === 1 && s.month === 2, scene: "newyear",
      text: "第一个春节。家里摆了酒席，亲戚都来了，说：<span class='dialog'>咱家出个公务员了。</span><br><span class='os'>（爸妈笑得合不拢嘴。）</span>",
      choices: [
        { label: "陪父母好好过年", hint: "家庭++ 心情+", effect: { family: 15, mood: 10, savings: -500 } },
        { label: "给长辈包红包", hint: "家庭+ 储蓄-", effect: { family: 10, savings: -1000, mood: 6 } },
        { label: "忙着应付亲戚", hint: "心情- 关系+", effect: { mood: -3, relation: 4 } }
      ]
    },
    { id: "first_train", stage: "newbie", type: "stage", weight: 100, once: true,
      cond: s => s.year <= 3, scene: "training",
      text: "单位安排新录用公务员初任培训，为期一个月。<br><span class='os'>（终于要正式上岗了。）</span>",
      choices: [
        { label: "认真学，做笔记", hint: "能力++ 领导+", effect: { ability: 8, leader: 5, health: -5 } },
        { label: "混日子，走个过场", hint: "心情+ 能力-", effect: { mood: 4, ability: -2 } },
        { label: "借机认识同批的人", hint: "关系++", effect: { relation: 10, ability: 2, health: -3 } }
      ]
    },
    { id: "first_mentor", stage: "newbie", type: "stage", weight: 100, once: true,
      cond: s => s.year <= 3, scene: "office",
      text: "科里给你安排了个师父，是个快退休的老同志。<br><span class='os'>（他说：这行啊，慢慢你就懂了。）</span>",
      choices: [
        { label: "虚心请教，多跑腿", hint: "能力+ 关系+ 身体-", effect: { ability: 5, relation: 6, health: -4 } },
        { label: "自己摸索，不麻烦人", hint: "能力+ 关系-", effect: { ability: 3, relation: -3 } },
        { label: "偶尔请他吃饭", hint: "关系++ 储蓄-", effect: { relation: 8, savings: -500 } }
      ]
    },
    { id: "first_mistake", stage: "newbie", type: "work", weight: 8,
      cond: s => s.year <= 3, scene: "office",
      text: "你第一次独立办事，出了个不大不小的差错。<br><span class='os'>（脸都红了。）</span>",
      choices: [
        { label: "主动向领导承认", hint: "领导+ 心情-", effect: { leader: 5, mood: -5, health: -2 } },
        { label: "自己悄悄补救", hint: "能力+ 身体-", effect: { ability: 4, health: -5 } },
        { label: "推说是同事没交代清楚", hint: "关系- 风险", risky: true, effect: { relation: -8, leader: 2 } }
      ]
    },
    
    /* ==================== 工作 · 材料 ==================== */
    { id: "mat1", stage: "any", type: "work", weight: 10, stat: "material", scene: "overtime",
      text: "领导指着屏幕：<span class='dialog'>这个材料，再改改。</span><br><span class='os'>（第几版了？）</span>",
      choices: [
        { label: "通宵改到他满意", hint: "能力+ 领导+ 身体- 头发-", effect: { ability: 4, leader: 6, health: -6, hair: -3, mood: -3 } },
        { label: "嘴上答应，回家睡觉", hint: "身体+ 心情+ 领导-", effect: { leader: -5, health: 5, mood: 3 } },
        { label: "把第一版发回去", hint: "玄学", risky: true, effect: { leader: 3, ability: 1, hair: -2 } }
      ]
    },
    { id: "mat2", stage: "any", type: "work", weight: 8, stat: "material", scene: "office",
      text: "材料改到第 9 版，领导皱眉：<span class='dialog'>还是第一版好。</span><br><span class='os'>（第一版我删了。）</span>",
      choices: [
        { label: "翻回收站找回来", hint: "能力+ 身体-", effect: { ability: 3, health: -4 } },
        { label: "重写一版冒充第一版", hint: "能力+ 头发-", effect: { ability: 4, hair: -2, leader: 2 } },
        { label: "坦白删了", hint: "领导印象微妙", risky: true, effect: { leader: -3, health: -2 } }
      ]
    },
    { id: "mat3", stage: "climb", type: "work", weight: 7, cond: s => s.ability > 25, stat: "material", scene: "overtime",
      text: "领导把一份重要讲话丢给你：<span class='dialog'>明天上午要用，你懂的。</span><br><span class='os'>（我不懂，但我必须懂。）</span>",
      choices: [
        { label: "熬夜憋出一篇", hint: "能力++ 头发-", effect: { ability: 6, hair: -4, health: -6, leader: 4 } },
        { label: "网上找模板套", hint: "能力+ 风险", risky: true, effect: { ability: 2, leader: 5, hair: -2 } },
        { label: "说时间太紧", hint: "领导-", effect: { leader: -7, health: 3 } }
      ]
    },
    
    /* ==================== 工作 · 加班 ==================== */
    { id: "weekend1", stage: "any", type: "work", weight: 9, stat: "overtime", scene: "overtime",
      text: "周五 17:58，工作群弹出：<span class='dialog'>周末大家加个班。</span><br><span class='os'>（急活？周五下午才有的急活？）</span>",
      choices: [
        { label: "秒回收到", hint: "领导+ 身体- 关系+", effect: { leader: 8, health: -6, relation: 3, hair: -2 } },
        { label: "假装没看见", hint: "领导- 身体+ 心情+", effect: { leader: -6, health: 6, mood: 4 } },
        { label: "转发给同事问", hint: "关系- 摸鱼", effect: { relation: -4, health: 4, leader: -2 } }
      ]
    },
    { id: "weekend2", stage: "any", type: "work", weight: 7, stat: "overtime", scene: "office",
      text: "连续加班第 12 天，早上照镜子，眼睛发青。<br><span class='os'>（这状态去上班，怕是要猝死。）</span>",
      choices: [
        { label: "请一天病假", hint: "身体+ 领导-", effect: { health: 12, leader: -5, mood: 3 } },
        { label: "硬扛去上班", hint: "领导+ 身体--", risky: true, effect: { leader: 5, health: -10, hair: -3 } },
        { label: "上班但摸鱼一天", hint: "身体+ 能力-", effect: { health: 6, ability: -3, mood: 2 } }
      ]
    },
    
    /* ==================== 工作 · 饭局 ==================== */
    { id: "dinner1", stage: "any", type: "work", weight: 8, stat: "dinner", scene: "dinner",
      text: "饭局上，领导端起酒杯：<span class='dialog'>小同志，表示一下？</span><br><span class='os'>（我的肝在颤抖。）</span>",
      choices: [
        { label: "一口闷", hint: "领导++ 身体--", effect: { leader: 10, health: -10, relation: 4 } },
        { label: "以茶代酒", hint: "身体+ 领导-", effect: { leader: -4, health: 3 } },
        { label: "替领导挡酒", hint: "领导+++ 身体---", risky: true, effect: { leader: 14, health: -15, relation: 5 } }
      ]
    },
    { id: "dinner2", stage: "climb", type: "work", weight: 6, cond: s => s.leader > 20, stat: "dinner", scene: "dinner",
      text: "又是饭局。领导把你介绍给别的单位领导：<span class='dialog'>这是我们科室的骨干。</span><br><span class='os'>（骨干=干活的骨头。）</span>",
      choices: [
        { label: "主动敬酒", hint: "关系+ 领导+ 身体-", effect: { relation: 6, leader: 4, health: -6 } },
        { label: "低调少说话", hint: "稳妥", effect: { leader: 2, health: -3 } },
        { label: "趁机加个微信", hint: "关系++ 风险", risky: true, effect: { relation: 8, leader: -2 } }
      ]
    },
    
    /* ==================== 工作 · 迎检 ==================== */
    { id: "inspect1", stage: "any", type: "work", weight: 7, stat: "inspect", scene: "inspect",
      text: "检查组下周来。全单位连夜补材料、擦桌子、练汇报。<br><span class='os'>（平时干嘛去了。）</span>",
      choices: [
        { label: "冲在一线", hint: "能力+ 领导+ 身体-", effect: { ability: 5, leader: 7, health: -6, hair: -2 } },
        { label: "负责写汇报稿", hint: "能力++ 头发-", effect: { ability: 7, hair: -3, health: -4 } },
        { label: "躲进档案室", hint: "身体+ 领导-", effect: { health: 8, leader: -6, mood: 3 } }
      ]
    },
    
    /* ==================== 工作 · 会议 ==================== */
    { id: "meeting1", stage: "any", type: "work", weight: 6, stat: "meeting", scene: "meeting",
      text: "今天开了三个会。第一个会的内容，在第二个会上又讲了一遍。<br><span class='os'>（第三个会决定：下次再开个会。）</span>",
      choices: [
        { label: "认真听，做笔记", hint: "能力+ 领导+ 身体-", effect: { ability: 2, leader: 1, health: -3, mood: -2 } },
        { label: "低头看手机", hint: "心情+ 领导-", effect: { mood: 3, leader: -2 } },
        { label: "假装记，其实画小人", hint: "心情+ 能力-", effect: { mood: 4, ability: -1 } }
      ]
    },
    
    /* ==================== 工作 · 背锅 ==================== */
    { id: "blame1", stage: "climb", type: "work", weight: 8, scene: "office",
      text: "项目出纰漏，会议室气氛凝固。领导扫视一圈：<span class='dialog'>这事谁负责的？</span><br><span class='os'>（签字的是我，干活的也是我。）</span>",
      choices: [
        { label: "主动认领", hint: "领导+ 关系+ 身体-", effect: { leader: 4, relation: 6, health: -5, hair: -2 } },
        { label: "沉默等别人开口", hint: "领导- 关系-", effect: { leader: -6, relation: -5 } },
        { label: "委婉指出流程问题", hint: "能力+ 风险", risky: true, effect: { ability: 3, leader: -2, relation: 1 } }
      ]
    },
    { id: "blame2", stage: "any", type: "work", weight: 6, scene: "office",
      text: "同事拿一份签了他名字的文件给你：<span class='dialog'>帮我签个字，走个流程。</span><br><span class='os'>（签字是要负责的。）</span>",
      choices: [
        { label: "签了", hint: "关系+ 风险", risky: true, effect: { relation: 7, leader: -1 } },
        { label: "拒绝", hint: "关系- 稳妥", effect: { relation: -5 } },
        { label: "先问什么事", hint: "能力+", effect: { ability: 2, relation: 2 } }
      ]
    },
    
    /* ==================== 工作 · 同事 ==================== */
    { id: "colleague1", stage: "any", type: "work", weight: 7, scene: "office",
      text: "同事把本该他写的材料推给你：<span class='dialog'>帮个忙，我家里有点事。</span><br><span class='os'>（你家里有事，我家就没事了？）</span>",
      choices: [
        { label: "接下来", hint: "关系+ 身体- 头发-", effect: { relation: 6, health: -4, hair: -2, mood: -2 } },
        { label: "委婉拒绝", hint: "关系- 身体+ 心情+", effect: { relation: -6, health: 4, mood: 3 } },
        { label: "接下来但拖着做", hint: "关系+ 摸鱼", effect: { relation: 2, health: 2, ability: -2 } }
      ]
    },
    { id: "colleague2", stage: "any", type: "work", weight: 6, scene: "canteen",
      text: "食堂里，几个同事在议论领导。有人回头看你：<span class='dialog'>你怎么看？</span><br><span class='os'>（送命题。）</span>",
      choices: [
        { label: "附和两句", hint: "关系+ 风险", risky: true, effect: { relation: 5, leader: -6 } },
        { label: "打哈哈糊弄", hint: "稳妥", effect: { relation: 1, ability: 1 } },
        { label: "转移话题", hint: "关系- 领导+", effect: { relation: -3, leader: 2 } }
      ]
    },
    { id: "colleague3", stage: "climb", type: "work", weight: 5, scene: "office",
      text: "你辛苦做的方案，被同事改了个名字交上去了。<br><span class='os'>（这也能行？）</span>",
      choices: [
        { label: "找他对质", hint: "关系- 领导+", effect: { relation: -8, leader: 4, health: -4 } },
        { label: "忍了", hint: "身体- 头发- 心情-", effect: { health: -5, hair: -3, mood: -5 } },
        { label: "直接找领导说明", hint: "领导+ 关系--", risky: true, effect: { leader: 6, relation: -9 } }
      ]
    },
    
    /* ==================== 工作 · 年假阴阳怪气 ==================== */
    { id: "annual_mock", stage: "any", type: "work", weight: 5,
      cond: s => s.annual < 10 && s.year >= 2, scene: "office",
      text: "你休假时发了条朋友圈。回来后，有同事阴阳怪气：<span class='dialog'>哟，还有空出去玩啊，我们可忙死了。</span><br><span class='os'>（无语。）</span>",
      choices: [
        { label: "笑笑不说话", hint: "心情- 关系+", effect: { mood: -4, relation: 2 } },
        { label: "回怼一句", hint: "心情+ 关系-", effect: { mood: 3, relation: -5 } },
        { label: "请全科室喝奶茶", hint: "关系+ 储蓄-", effect: { relation: 6, savings: -200 } }
      ]
    },
    
    /* ==================== 工作 · 诱惑 ==================== */
    { id: "bribe1", stage: "mid", type: "work", weight: 4, risky: true, scene: "office",
      text: "有人塞给你一个信封：<span class='dialog'>一点小意思，事成之后还有。</span><br><span class='os'>（这……烫手。）</span>",
      choices: [
        { label: "坚决退回", hint: "领导+ 心情+", effect: { leader: 6, health: 2, mood: 3 } },
        { label: "收下", hint: "储蓄+ 风险", risky: true, effect: { savings: 5000, leader: -3, health: -5 }, flag: { corrupt: true } },
        { label: "假装没看见", hint: "领导+", effect: { leader: 3 } }
      ]
    },
    { id: "report1", stage: "mid", type: "work", weight: 4, cond: s => s.leader > 25, scene: "office",
      text: "有人匿名举报你。纪委找你谈话。<br><span class='os'>（我得罪谁了？）</span>",
      choices: [
        { label: "配合调查，如实说明", hint: "身体- 领导+", effect: { health: -5, leader: 2, mood: -5 } },
        { label: "找关系摆平", hint: "储蓄- 领导+", risky: true, effect: { savings: -3000, leader: 4, health: -3 } },
        { label: "情绪崩溃", hint: "心情--", effect: { mood: -15, health: -6 } }
      ]
    },
    
    /* ==================== 工作 · 带新人 ==================== */
    { id: "newbie1", stage: "mid", type: "work", weight: 6, cond: s => s.age >= 35, scene: "office",
      text: "带了个新人。他和你当年一样，什么都问，什么都做。<br><span class='os'>（看着像照镜子。）</span>",
      choices: [
        { label: "认真带，倾囊相授", hint: "关系+ 心情+ 能力+", effect: { relation: 8, mood: 6, ability: 2 } },
        { label: "留一手，防着点", hint: "能力+ 关系-", effect: { ability: 2, relation: -4 } },
        { label: "能帮就帮，不勉强", hint: "关系+ 心情+", effect: { relation: 3, mood: 3 } }
      ]
    },
    
    /* ==================== 出差 / 接待 / 培训 ==================== */
    { id: "trip1", stage: "any", type: "work", weight: 6, scene: "trip",
      text: "临时通知：明天去外地出差，三天。<br><span class='os'>（又是说走就走。）</span>",
      choices: [
        { label: "认真准备，好好表现", hint: "能力+ 领导+ 身体-", effect: { ability: 3, leader: 4, health: -5 } },
        { label: "当旅游，顺便逛逛", hint: "心情+ 能力-", effect: { mood: 6, ability: -2 } },
        { label: "找借口推掉", hint: "领导- 身体+", effect: { leader: -6, health: 4 } }
      ]
    },
    { id: "receive1", stage: "climb", type: "work", weight: 6, cond: s => s.rank >= 1 && s.age >= 30, scene: "receive",
      text: "上级单位来人，领导让你负责接待。<br><span class='os'>（接待是门学问。）</span>",
      choices: [
        { label: "全程陪同，安排周到", hint: "领导+ 关系+ 身体- 储蓄-", effect: { leader: 6, relation: 5, health: -6, savings: -500 } },
        { label: "按标准来，不铺张", hint: "领导+ 稳妥", effect: { leader: 3 } },
        { label: "交给下属去办", hint: "关系- 领导-", effect: { relation: -4, leader: -4, health: 3 } }
      ]
    },
    { id: "train1", stage: "any", type: "work", weight: 6, scene: "training",
      text: "单位组织培训，为期一周。<br><span class='os'>（又要听课。）</span>",
      choices: [
        { label: "认真听，记笔记", hint: "能力+ 领导+ 身体-", effect: { ability: 5, leader: 4, health: -5 } },
        { label: "上课摸鱼", hint: "心情+ 能力-", effect: { mood: 4, ability: -3 } },
        { label: "借机认识其他单位的人", hint: "关系++", effect: { relation: 8, ability: 2, health: -4 } }
      ]
    },
    
    /* ==================== 生活 · 情绪 ==================== */
    { id: "emo_mon", stage: "any", type: "life", weight: 9, scene: "commute",
      text: "闹钟响了。你按掉，又响，再按掉。第三次响的时候，你盯着天花板：<span class='dialog'>我为什么要上班？</span><br><span class='os'>（没有答案。）</span>",
      choices: [
        { label: "挣扎着起床", hint: "心情- 领导+", effect: { mood: -2, health: -1, leader: 1 } },
        { label: "请半天假", hint: "心情+ 领导-", effect: { mood: 5, leader: -2 } },
        { label: "刷手机到迟到", hint: "心情+ 领导-", effect: { mood: 2, leader: -4, health: -2 } }
      ]
    },
    { id: "emo_night", stage: "any", type: "life", weight: 8, stat: "overtime", scene: "overtime",
      text: "晚上十点，整层楼只剩你这一盏灯。你忽然想不起来今天到底忙了什么。<br><span class='os'>（好像什么也没干成。）</span>",
      choices: [
        { label: "继续干完", hint: "能力+ 心情- 头发-", effect: { ability: 2, mood: -5, hair: -2 } },
        { label: "收拾回家", hint: "心情+", effect: { mood: 3, ability: -1 } },
        { label: "站在窗前发呆", hint: "心情- 身体-", effect: { mood: -2, health: -2 } }
      ]
    },
    { id: "emo_sunday", stage: "any", type: "life", weight: 7, scene: "home",
      text: "周日晚上，一想到明天要上班，胸口发闷。<br><span class='os'>（一周又开始了。）</span>",
      choices: [
        { label: "早点睡", hint: "身体+ 心情-", effect: { health: 3, mood: -1 } },
        { label: "熬夜刷剧", hint: "心情+ 身体-", effect: { mood: 4, health: -4 } },
        { label: "出门散散步", hint: "心情+ 身体+", effect: { mood: 5, health: 2 } }
      ]
    },
    { id: "emo_salary", stage: "any", type: "life", weight: 7, scene: "money",
      text: "工资到账。你看了眼数字，又看了眼支出。<br><span class='os'>（又没剩多少。）</span>",
      choices: [
        { label: "算了，习惯了", hint: "心情-", effect: { mood: -1 } },
        { label: "看看有没有副业机会", hint: "开启副业", effect: { ability: 1, mood: -1 }, flag: { sideJob: true } },
        { label: "给家人买点东西", hint: "储蓄- 心情+", effect: { savings: -300, mood: 3 } }
      ]
    },
    { id: "emo_post", stage: "any", type: "life", weight: 5, scene: "home",
      text: "深夜，你刷到一篇辞职去大理的帖子。你看完了，又看了一遍评论区。<br><span class='os'>（如果当年……）</span>",
      choices: [
        { label: "关掉睡觉", hint: "心情-", effect: { mood: -1 } },
        { label: "收藏了", hint: "心情+ 身体-", effect: { mood: 2, health: -2 } },
        { label: "转发给朋友", hint: "关系+ 心情+", effect: { relation: 2, mood: 1 } }
      ]
    },
    
    /* ==================== 生活 · 小确幸 ==================== */
    { id: "luck1", stage: "any", type: "life", weight: 6, scene: "canteen",
      text: "食堂阿姨今天多给你打了一勺肉，还冲你笑了笑。<br><span class='os'>（今天好像没那么糟。）</span>",
      choices: [
        { label: "说声谢谢", hint: "心情+", effect: { mood: 5 } },
        { label: "多要一勺", hint: "心情+ 关系+", effect: { mood: 4, relation: 1 } }
      ]
    },
    { id: "luck2", stage: "any", type: "life", weight: 6, cond: s => s.marital === "married", scene: "home",
      text: "加班回家，发现家人给你留了饭，还热着。<br><span class='os'>（鼻子有点酸。）</span>",
      choices: [
        { label: "吃完，去道谢", hint: "心情+ 家庭+", effect: { mood: 8, family: 5 } },
        { label: "默默吃完", hint: "心情+", effect: { mood: 5 } }
      ]
    },
    { id: "luck3", stage: "any", type: "life", weight: 6, scene: "office",
      text: "领导路过你工位，随口说了句：<span class='dialog'>辛苦了。</span><br><span class='os'>（就这三个字，你记了一整天。）</span>",
      choices: [
        { label: "笑笑说应该的", hint: "心情+ 领导+", effect: { mood: 6, leader: 2 } },
        { label: "趁机汇报工作", hint: "能力+ 领导+", effect: { ability: 2, leader: 3 } }
      ]
    },
    { id: "luck4", stage: "any", type: "life", weight: 5, scene: "office",
      text: "收到一封群众的感谢信，字迹工整，说谢谢你上次帮忙。<br><span class='os'>（原来真的有人记得。）</span>",
      choices: [
        { label: "收好，放进抽屉", hint: "心情++", effect: { mood: 10 } },
        { label: "拿给领导看", hint: "领导+ 心情+", effect: { leader: 4, mood: 4 } }
      ]
    },
    
    /* ==================== 生活 · 健康 ==================== */
    { id: "fit1", stage: "any", type: "life", weight: 6, cond: s => !s.buffs.fit, scene: "home",
      text: "同事约你一起办健身卡。<br><span class='os'>（要动起来吗。）</span>",
      choices: [
        { label: "办，开始锻炼", hint: "储蓄- 身体+ 心情+", effect: { savings: -800, health: 8, mood: 5 }, flag: { fit: true } },
        { label: "不去，没时间", hint: "身体- 心情-", effect: { health: -2, mood: -1 } }
      ]
    },
    { id: "check1", stage: "any", type: "life", weight: 5, cond: s => !s.buffs.checked && s.age > 30, scene: "hospital",
      text: "单位组织体检，可以选套餐。<br><span class='os'>（查一查吧。）</span>",
      choices: [
        { label: "做全面体检", hint: "医保- 身体+", effect: { medical: -1000, health: 6 }, flag: { checked: true } },
        { label: "做基础就行", hint: "医保- 身体+", effect: { medical: -300, health: 2 } },
        { label: "不去了", hint: "身体- 心情-", effect: { health: -2, mood: -1 } }
      ]
    },
    { id: "tea1", stage: "any", type: "life", weight: 5, scene: "office",
      text: "抽屉里的茶叶又多了几罐。各种会议发的，喝不完。<br><span class='os'>（攒着吧。）</span>",
      choices: [
        { label: "收好，以后慢慢喝", hint: "心情+", effect: { mood: 2 }, stat: "tea" },
        { label: "分给同事", hint: "关系+ 心情+", effect: { relation: 4, mood: 2 } },
        { label: "带回家给家人", hint: "家庭+ 心情+", effect: { family: 3, mood: 2 } }
      ]
    },
    { id: "sick1", stage: "any", type: "life", weight: 6, cond: s => s.health < 60, scene: "hospital",
      text: "你发烧了，浑身没劲。<br><span class='os'>（去医院吧。）</span>",
      choices: [
        { label: "去医院，走医保", hint: "医保- 身体+", effect: { medical: -500, health: 12, mood: 2 } },
        { label: "自己扛，买点药", hint: "储蓄- 身体+", effect: { savings: -200, health: 6 } },
        { label: "硬撑上班", hint: "领导+ 身体--", effect: { leader: 3, health: -8 } }
      ]
    },
    
    /* ==================== 生活 · 家庭（已婚） ==================== */
    { id: "family1", stage: "climb", type: "life", weight: 7,
      cond: s => s.marital === "married", scene: "home",
      text: "晚上十点回家，家人坐在沙发上：<span class='dialog'>你还知道回来？</span><br><span class='os'>（我也不想啊。）</span>",
      choices: [
        { label: "道歉，周末陪家人", hint: "身体+ 家庭+ 领导-", effect: { health: 6, leader: -4, family: 8, mood: 4 } },
        { label: "解释工作忙", hint: "家庭- 领导+", effect: { family: -6, leader: 3, mood: -2 } },
        { label: "沉默去洗澡", hint: "身体+ 家庭--", effect: { health: 4, family: -8, mood: -4 } }
      ]
    },
    
    /* ==================== 生活 · 孩子（必须有孩子） ==================== */
    { id: "child_baby", stage: "any", type: "life", weight: 8,
      cond: s => s.hasChild && s.childYears < 3, scene: "home",
      text: "孩子半夜哭闹，你起来换尿布、冲奶粉。<br><span class='os'>（一夜没睡好。）</span>",
      choices: [
        { label: "起来照顾", hint: "家庭+ 身体-", effect: { family: 8, health: -5 } },
        { label: "让配偶去", hint: "家庭- 身体+", effect: { family: -5, health: 4 } },
        { label: "轮流起来", hint: "家庭+ 身体-", effect: { family: 5, health: -3 } }
      ]
    },
    { id: "child_kinder", stage: "any", type: "life", weight: 8,
      cond: s => s.hasChild && s.childYears >= 3 && s.childYears < 6, scene: "child",
      text: "孩子在幼儿园拿了朵小红花，举着给你看。<br><span class='os'>（真快啊。）</span>",
      choices: [
        { label: "夸他，贴墙上", hint: "家庭++ 心情+", effect: { family: 8, mood: 8 } },
        { label: "随口应付", hint: "家庭- 心情-", effect: { family: -5, mood: -2 } }
      ]
    },
    { id: "child_homework", stage: "any", type: "life", weight: 8,
      cond: s => s.hasChild && s.childYears >= 6 && s.childYears < 15, scene: "child",
      text: "辅导孩子写作业，讲了五遍他还是不会。<br><span class='os'>（血压上来了。）</span>",
      choices: [
        { label: "忍住，再讲一遍", hint: "家庭+ 身体- 心情-", effect: { family: 6, health: -4, mood: -5 } },
        { label: "发火了", hint: "家庭- 心情-", effect: { family: -8, mood: -6 } },
        { label: "让他自己琢磨", hint: "心情+ 家庭-", effect: { mood: 3, family: -3 } }
      ]
    },
    { id: "child_tutor", stage: "any", type: "life", weight: 6,
      cond: s => s.hasChild && s.childYears >= 6 && s.childYears < 18, scene: "child",
      text: "老师说孩子成绩下滑，建议报个补习班。<br><span class='os'>（又是一笔钱。）</span>",
      choices: [
        { label: "报，不能输在起跑线", hint: "储蓄-- 家庭+", effect: { savings: -3000, family: 6 } },
        { label: "不报，让他自己学", hint: "储蓄+ 家庭-", effect: { family: -4 } },
        { label: "自己辅导", hint: "家庭+ 身体- 心情-", effect: { family: 5, health: -5, mood: -3 } }
      ]
    },
    { id: "child_rebel", stage: "any", type: "life", weight: 6,
      cond: s => s.hasChild && s.childYears >= 12 && s.childYears < 18, scene: "child",
      text: "孩子进入叛逆期，你说一句他顶三句。<br><span class='os'>（这熊孩子。）</span>",
      choices: [
        { label: "耐心沟通", hint: "家庭+ 心情-", effect: { family: 6, mood: -4 } },
        { label: "严厉管教", hint: "家庭- 心情-", effect: { family: -6, mood: -5 } },
        { label: "冷处理，不理他", hint: "心情+ 家庭-", effect: { mood: 2, family: -4 } }
      ]
    },
    { id: "child_highschool", stage: "any", type: "life", weight: 6,
      cond: s => s.hasChild && s.childYears >= 15 && s.childYears < 18, scene: "child",
      text: "孩子上晚自习，你每天十点去接。<br><span class='os'>（风里雨里。）</span>",
      choices: [
        { label: "天天去接", hint: "家庭++ 身体-", effect: { family: 8, health: -5 } },
        { label: "让他自己回", hint: "家庭- 身体+", effect: { family: -4, health: 3 } },
        { label: "周末再接", hint: "家庭+ 身体-", effect: { family: 4, health: -2 } }
      ]
    },
    { id: "child_gaokao", stage: "any", type: "life", weight: 100, once: true,
      cond: s => s.hasChild && s.childYears === 18, scene: "child",
      text: "孩子高考了。<br><span class='os'>（比我自己考还紧张。）</span>",
      choices: [
        { label: "请假陪考两天", hint: "家庭++ 领导-", effect: { family: 15, mood: 8, leader: -5 } },
        { label: "嘴上鼓励，照常上班", hint: "家庭+ 心情-", effect: { family: 3, mood: -3 } },
        { label: "找关系打听消息", hint: "储蓄- 风险", risky: true, effect: { savings: -5000, family: 4, leader: -3 } }
      ]
    },
    
    /* ==================== 生活 · 父母 ==================== */
    { id: "parents1", stage: "mid", type: "life", weight: 6, scene: "hospital",
      text: "父亲/母亲生病住院了，需要人照顾。<br><span class='os'>（工作这边也走不开。）</span>",
      choices: [
        { label: "请假去照顾", hint: "领导- 身体- 家庭+ 心情+", effect: { leader: -5, health: -3, mood: 5, family: 8 } },
        { label: "请护工，自己上班", hint: "储蓄- 家庭-", effect: { savings: -2000, family: -3, mood: -3 } },
        { label: "自己多跑几趟", hint: "身体- 家庭+", effect: { health: -6, family: 5 } }
      ]
    },
    
    /* ==================== 过年 ==================== */
    { id: "spring1", stage: "any", type: "life", weight: 100, once: true,
      cond: s => s.month === 2 && s.year >= 2, scene: "spring",
      text: "大年三十，排班表上又是你的名字。窗外鞭炮声，办公室里只有你和一台老电脑。<br><span class='os'>（第几次了？）</span>",
      choices: [
        { label: "认真值班", hint: "领导+ 心情-", effect: { leader: 3, mood: -5, relation: 1 } },
        { label: "摸鱼看春晚", hint: "心情+ 领导-", effect: { mood: 3, leader: -1 } },
        { label: "找人换班", hint: "关系- 心情+", effect: { relation: -3, mood: 3 } }
      ]
    },
    { id: "newyear1", stage: "any", type: "life", weight: 100, once: true,
      cond: s => s.month === 2 && s.year >= 2, scene: "newyear",
      text: "过年了，要走亲戚、拜年、发红包。<br><span class='os'>（一年又过去了。）</span>",
      choices: [
        { label: "包大红包，走遍亲戚", hint: "家庭++ 储蓄-1000", effect: { family: 12, savings: -1000, mood: 6 } },
        { label: "包小红包，意思一下", hint: "家庭+ 储蓄-500", effect: { family: 5, savings: -500, mood: 3 } },
        { label: "宅在家，不串门", hint: "心情+ 家庭-", effect: { mood: 4, family: -5, savings: -200 } }
      ]
    },
    { id: "redpacket_baby", stage: "any", type: "life", weight: 6,
      cond: s => s.month >= 1 && s.month <= 2 && s.age >= 28, scene: "newyear",
      text: "亲戚家添了小孩，办满月酒。<br><span class='os'>（红包得准备。）</span>",
      choices: [
        { label: "包 888", hint: "储蓄- 家庭+", effect: { savings: -888, family: 8, mood: 3 } },
        { label: "包 500", hint: "储蓄- 家庭+", effect: { savings: -500, family: 4 } },
        { label: "人不去，礼到", hint: "储蓄- 家庭-", effect: { savings: -300, family: -3 } }
      ]
    },
    { id: "redpacket_exam", stage: "any", type: "life", weight: 6,
      cond: s => s.month >= 6 && s.month <= 8 && s.age >= 35, scene: "newyear",
      text: "亲戚家孩子考上大学，办升学宴。<br><span class='os'>（又是一笔。）</span>",
      choices: [
        { label: "包 1000", hint: "储蓄- 家庭+", effect: { savings: -1000, family: 10, mood: 4 } },
        { label: "包 500", hint: "储蓄- 家庭+", effect: { savings: -500, family: 5 } },
        { label: "口头祝贺", hint: "家庭-", effect: { family: -4 } }
      ]
    },
    
    /* ==================== 年终总结（5 年后） ==================== */
    { id: "summary1", stage: "any", type: "work", weight: 100, once: true,
      cond: s => s.month === 12 && s.year >= 5, scene: "office",
      text: "又到了写年终总结的时候。你的个人总结已经连续五年开头是<span class='dialog'>在领导的关怀下</span>。<br><span class='os'>（今年要不要换个开头。）</span>",
      choices: [
        { label: "认真写，突出成绩", hint: "领导+ 能力+", effect: { leader: 2, ability: 1 } },
        { label: "复制去年的改改", hint: "心情- 能力-", effect: { mood: -1, ability: -1 } },
        { label: "写得谦虚点", hint: "领导+ 心情+", effect: { leader: 1, mood: 1 } }
      ]
    },
    
    /* ==================== 年假 ==================== */
    { id: "annual1", stage: "any", type: "life", weight: 6, scene: "home",
      text: "手里还有几天年假没用。<br><span class='os'>（要不要休？）</span>",
      choices: [
        { label: "休几天，出去走走", hint: "身体+ 心情++ 储蓄-", effect: { health: 10, mood: 12, savings: -1500 } },
        { label: "在家躺两天", hint: "身体+ 心情+", effect: { health: 8, mood: 6 } },
        { label: "不休，换成钱", hint: "储蓄+ 心情-", effect: { savings: 2000, mood: -3 } }
      ]
    },
    
    /* ==================== 强制事件 ==================== */
    { id: "force_health", stage: "any", type: "force", weight: 100,
      cond: s => s.health < 35 && !s.buffs.checked, scene: "hospital",
      text: "你最近总觉得累，爬两层楼就喘。<br><span class='os'>（是不是该去看看了。）</span>",
      choices: [
        { label: "去医院体检", hint: "医保- 身体+", effect: { medical: -800, health: 12, mood: 3 }, flag: { checked: true } },
        { label: "扛着，没事", hint: "身体- 心情-", effect: { health: -6, mood: -3 } }
      ]
    },
    { id: "force_rest", stage: "any", type: "force", weight: 100,
      cond: s => s.health < 25, scene: "home",
      text: "你实在扛不住了，头晕得厉害，只能请假在家躺着。<br><span class='os'>（身体要紧。）</span>",
      choices: [
        { label: "请一周假，好好休息", hint: "身体++ 领导-", effect: { health: 18, leader: -4, mood: 5 } },
        { label: "在家办公", hint: "身体+ 能力-", effect: { health: 10, ability: -2 } }
      ]
    },
    { id: "force_mood", stage: "any", type: "force", weight: 100,
      cond: s => s.mood < 20, scene: "home",
      text: "你在地铁上，突然觉得眼眶发热。你也不知道为什么。<br><span class='os'>（就是想哭。）</span>",
      choices: [
        { label: "请一天假，自己待着", hint: "心情+ 领导-", effect: { mood: 12, leader: -3, health: 3 } },
        { label: "硬撑着去上班", hint: "心情- 身体-", effect: { mood: -5, health: -6 } },
        { label: "给朋友打个电话", hint: "心情+ 关系+", effect: { mood: 8, relation: 3 } }
      ]
    },
    { id: "force_corrupt", stage: "any", type: "force", weight: 100,
      cond: s => s.flags.corrupt, scene: "office",
      text: "风声紧了。单位在查账，你想起那个信封，手心出汗。<br><span class='os'>（当初不该收。）</span>",
      choices: [
        { label: "主动上交，说明情况", hint: "领导+ 储蓄-", effect: { leader: 8, savings: -3000, health: 4 }, flag: { corrupt: false } },
        { label: "装作没事", hint: "风险持续", risky: true, effect: { health: -10, leader: -2 } }
      ]
    },
    { id: "force_sidejob", stage: "any", type: "force", weight: 100,
      cond: s => s.sideJob && !s.sideJobKnown && s.year > 3, scene: "office",
      text: "有同事发现你在做副业，悄悄问你：<span class='dialog'>这……不违规吗？</span><br><span class='os'>（被发现了。）</span>",
      choices: [
        { label: "请他保密，以后低调点", hint: "关系+ 风险", risky: true, effect: { relation: 3, mood: -3 }, flag: { sideJobKnown: true } },
        { label: "停止副业", hint: "稳妥", effect: { mood: -5 }, flag: { sideJobKnown: true } },
        { label: "不承认", hint: "关系- 风险", effect: { relation: -5, mood: -2 }, flag: { sideJobKnown: true } }
      ]
    },
    
    /* ==================== 年龄节点 ==================== */
    { id: "age_eye", stage: "any", type: "force", weight: 100, once: true,
      cond: s => s.age === 42, scene: "report",
      text: "你发现自己看材料要拿远了。<br><span class='os'>（老花了。）</span>",
      choices: [
        { label: "配副老花镜", hint: "储蓄- 身体+", effect: { savings: -400, health: 3, mood: -2 } },
        { label: "硬撑", hint: "身体- 心情-", effect: { health: -4, mood: -3 } }
      ]
    },
    { id: "age_tooth", stage: "any", type: "force", weight: 100, once: true,
      cond: s => s.age === 48, scene: "hospital",
      text: "吃排骨时，你听到嘴里咔的一声。医生说，要补牙。<br><span class='os'>（一颗牙，两千块。）</span>",
      choices: [
        { label: "补牙（走医保）", hint: "医保- 身体+", effect: { medical: -2000, health: 4 } },
        { label: "先扛着", hint: "身体- 心情-", effect: { health: -6, mood: -2 } }
      ]
    },
    
    /* ==================== 阶段剧情 ==================== */
    { id: "rent1", stage: "newbie", type: "stage", weight: 100, once: true, scene: "home",
      text: "工作一年了，你还在合租。室友半夜打游戏，你第二天要早起。<br><span class='os'>（要不要搬？）</span>",
      choices: [
        { label: "整租一居室", hint: "储蓄- 身体+ 心情+", effect: { savings: -3000, health: 5, mood: 8 }, flag: { living: "alone" } },
        { label: "继续合租，省钱", hint: "储蓄+ 心情-", effect: { savings: 1000, mood: -3 } },
        { label: "用公积金租房", hint: "公积金- 心情+", effect: { fund: -2000, mood: 5, health: 3 } }
      ]
    },
    { id: "date1", stage: "newbie", type: "stage", weight: 100, once: true,
      cond: s => s.marital === "single" && s.age >= 26, scene: "date",
      text: "亲戚给你介绍了个对象，说<span class='dialog'>条件不错，见见？</span><br><span class='os'>（要不要去？）</span>",
      choices: [
        { label: "去见见", hint: "心情+ 开启恋爱", effect: { mood: 5 }, flag: { marital: "dating" } },
        { label: "暂时不想，先忙事业", hint: "领导+ 能力+", effect: { leader: 2, ability: 2, mood: -2 } },
        { label: "去了，但没感觉", hint: "心情+ 关系+", effect: { mood: 2, relation: 1 } }
      ]
    },
    { id: "marry1", stage: "climb", type: "stage", weight: 100, once: true,
      cond: s => s.marital === "dating" && s.age >= 28, scene: "wedding",
      text: "相处一年多，对方问你：<span class='dialog'>要不要考虑结婚？</span><br><span class='os'>（你愣了一下。）</span>",
      choices: [
        { label: "结婚", hint: "心情++ 家庭++ 婚后压力减半", effect: { mood: 12, family: 30 }, flag: { marital: "married" } },
        { label: "再等等，事业为重", hint: "领导+ 家庭-", effect: { leader: 3, family: -10, mood: -5 } },
        { label: "坦白还没准备好", hint: "心情- 家庭-", effect: { mood: -8, family: -15 } }
      ]
    },
    { id: "house1", stage: "climb", type: "stage", weight: 100, once: true,
      cond: s => s.savings >= 100000 && s.age >= 28 && s.living !== "owned", scene: "home",
      text: "手头有点积蓄，买房提上日程。房子 150 万，首付 30 万。<br><span class='os'>（掏空六个钱包？）</span>",
      choices: [
        { label: "父母支持首付", hint: "你出10万 父母出20万 月供30%", effect: { savings: -100000, family: 10, mood: 8 }, flag: { living: "owned" } },
        { label: "自己承担首付", hint: "你出30万 月供30%", effect: { savings: -300000, health: -3, family: 15, mood: 8 }, flag: { living: "owned" } },
        { label: "继续租房", hint: "不买 家庭-", effect: { mood: -5, family: -5 } }
      ]
    },
    { id: "house_loan", stage: "any", type: "life", weight: 100,
      cond: s => s.living === "owned" && s.year % 2 === 0 && s.month === 3, scene: "money",
      text: "银行来电：房贷还剩一些本金，可以考虑提前还完。<br><span class='os'>（要不要还？）</span>",
      choices: [
        { label: "一次性还完", hint: "储蓄-30万 不再月供", effect: { savings: -300000, mood: 8 } },
        { label: "继续月供", hint: "保持现状", effect: {} }
      ]
    },
    { id: "child1", stage: "climb", type: "stage", weight: 100, once: true,
      cond: s => s.marital === "married" && s.age >= 31 && !s.childLocked, scene: "home",
      text: "家里开始催生。<span class='dialog'>趁我们还带得动。</span><br><span class='os'>（要吗？）</span>",
      choices: [
        { label: "要孩子", hint: "心情++ 家庭++ 储蓄-", effect: { mood: 12, family: 20, savings: -2000, health: -5 }, flag: { hasChild: true } },
        { label: "做丁克", hint: "心情+ 家庭- 锁定", effect: { mood: 3, family: -12, leader: 2 }, flag: { childLocked: true } },
        { label: "再等两年", hint: "心情- 家庭-", effect: { mood: -2, family: -5 } }
      ]
    },
    { id: "promo_first", stage: "climb", type: "stage", weight: 100, once: true,
      cond: s => s.rank === 0 && s.age >= 27 && s.age <= 35, scene: "promote",
      text: "工作几年了。这次副科有一个位置，领导找你谈话：<span class='dialog'>想不想试试？</span><br><span class='os'>（等这一天很久了。）</span>",
      choices: [
        { label: "主动争取", hint: "领导+ 身体-", effect: { leader: 8, health: -5, hair: -2 }, flag: { promoTry: true } },
        { label: "等组织安排", hint: "领导+", effect: { leader: 2 } },
        { label: "找关系活动", hint: "储蓄- 关系+ 风险", risky: true, effect: { savings: -3000, relation: 6, leader: 3 } }
      ]
    },
    { id: "key35", stage: "mid", type: "stage", weight: 100, once: true,
      cond: s => s.age === 35, scene: "office",
      text: "你 35 岁了。有人说，35 岁是道坎。<br><span class='os'>（回首这几年，好像也没做成什么大事。）</span>",
      choices: [
        { label: "趁还有机会，拼一把", hint: "能力+ 领导+ 身体-", effect: { ability: 8, health: -6, hair: -2, leader: 5 } },
        { label: "稳一点，照顾家庭", hint: "家庭+ 身体+", effect: { family: 8, health: 4, leader: -3 } },
        { label: "看开了，顺其自然", hint: "心情+ 身体+", effect: { mood: 10, health: 3 } }
      ]
    },
    { id: "crisis1", stage: "mid", type: "life", weight: 6,
      cond: s => s.age >= 38 && s.age <= 45, scene: "home",
      text: "你半夜醒来，再也睡不着。想到自己快四十了，突然一阵心慌。<br><span class='os'>（这就是中年危机吗。）</span>",
      choices: [
        { label: "开始健身，跑步", hint: "身体+ 心情+ 储蓄-", effect: { health: 12, mood: 5, savings: -500 }, flag: { fit: true } },
        { label: "看书，重新规划", hint: "能力+ 心情+", effect: { ability: 4, mood: 4 } },
        { label: "算了，继续睡", hint: "身体- 心情-", effect: { health: -3, mood: -3 } }
      ]
    },
    { id: "reunion1", stage: "mid", type: "life", weight: 100, once: true,
      cond: s => s.year >= 10 && s.age >= 33, scene: "reunion",
      text: "工作十年了，老同学聚会。<br>有人创业，有人跳槽，有人出国。轮到你，你端起杯：<span class='dialog'>我还在单位。</span><br><span class='os'>（这句话，说了十年。但不后悔。）</span>",
      choices: [
        { label: "聊聊这些年的踏实", hint: "心情+ 关系+", effect: { mood: 8, relation: 4 } },
        { label: "听他们讲，笑而不语", hint: "心情+", effect: { mood: 4 } },
        { label: "有点羡慕，但没说", hint: "心情- 能力+", effect: { mood: -4, ability: 2 } }
      ]
    },
    { id: "key45", stage: "late", type: "stage", weight: 100, once: true,
      cond: s => s.age === 45, scene: "office",
      text: "你 45 岁了。头发白了一些，眼睛开始花。单位里新来的年轻人，叫你老师。<br><span class='os'>（原来我已经是老师了。）</span>",
      choices: [
        { label: "接受，好好带新人", hint: "关系+ 心情+", effect: { relation: 8, mood: 6 } },
        { label: "心有不甘，还想拼", hint: "能力+ 身体- 头发-", effect: { ability: 5, health: -5, hair: -2 } },
        { label: "开始养生", hint: "身体+ 储蓄-", effect: { health: 10, savings: -1000, mood: 3 }, flag: { fit: true } }
      ]
    },
    { id: "key50", stage: "late", type: "stage", weight: 100, once: true,
      cond: s => s.age === 50, scene: "report",
      text: "体检报告出来了，毛病不少。医生让你注意。<br><span class='os'>（50 了。）</span>",
      choices: [
        { label: "认真养生，锻炼", hint: "身体+ 储蓄-", effect: { health: 14, savings: -1500, mood: 5 }, flag: { fit: true } },
        { label: "该吃吃该喝喝", hint: "心情+ 身体-", effect: { mood: 8, health: -6 } },
        { label: "定期体检", hint: "医保- 身体+", effect: { medical: -800, health: 8 }, flag: { checked: true } }
      ]
    },
    { id: "retire_line", stage: "final", type: "stage", weight: 100, once: true,
      cond: s => s.age >= 55, scene: "office",
      text: "快到站了。有人开始退二线，有人还在岗位上。<br><span class='os'>（这些年，值吗？）</span>",
      choices: [
        { label: "主动让位给年轻人", hint: "关系+ 心情+", effect: { relation: 8, mood: 8 } },
        { label: "站好最后一班岗", hint: "领导+ 身体-", effect: { leader: 4, health: -4 } },
        { label: "开始规划退休生活", hint: "心情+ 身体+", effect: { mood: 10, health: 5 } }
      ]
    },
    
    /* ==================== 独身线 ==================== */
    { id: "single1", stage: "mid", type: "life", weight: 6,
      cond: s => s.marital === "single" && s.age >= 38, scene: "home",
      text: "同事问你为什么不结婚，你笑了笑没说话。<br><span class='os'>（一个人也挺好。）</span>",
      choices: [
        { label: "享受独处，培养爱好", hint: "心情+ 身体+", effect: { mood: 8, health: 5 } },
        { label: "养了只猫", hint: "心情+ 储蓄-", effect: { mood: 6, savings: -500 } },
        { label: "还是想找个人", hint: "心情- 开启恋爱", effect: { mood: -3 }, flag: { marital: "dating" } }
      ]
    },
    
    /* ==================== 突发 ==================== */
    { id: "sud1", stage: "any", type: "work", weight: 4, scene: "office",
      text: "【突发】上级来暗访，点名要看你的材料。而你刚把它删了。<br><span class='os'>（完了。）</span>",
      choices: [
        { label: "冷静，说在整理新版", hint: "风险", risky: true, effect: { ability: 3, leader: -4, health: -5, hair: -2 } },
        { label: "从回收站恢复", hint: "运气", effect: { leader: 2, health: -4 } },
        { label: "实话实说", hint: "领导--", effect: { leader: -10, health: -3 } }
      ]
    },
    { id: "sud2", stage: "any", type: "work", weight: 4, scene: "training",
      text: "【突发】单位通知：明天全体参加为期三天的封闭培训，不准请假。<br><span class='os'>（我的周末……）</span>",
      choices: [
        { label: "认真参加", hint: "能力+ 领导+ 身体-", effect: { ability: 5, leader: 5, health: -5, hair: -2 } },
        { label: "上课睡觉", hint: "身体+ 能力-", effect: { health: 5, ability: -4, leader: -3 } },
        { label: "借机认识其他单位的人", hint: "关系++", effect: { relation: 8, ability: 2, health: -4 } }
      ]
    },
    { id: "sud3", stage: "any", type: "work", weight: 3, cond: s => s.year > 8, scene: "office",
      text: "【突发】你负责的窗口被群众投诉了。领导脸色很难看。<br><span class='os'>（那天明明是系统卡了。）</span>",
      choices: [
        { label: "主动写检查", hint: "领导+ 头发-", effect: { leader: 5, hair: -2, health: -4 } },
        { label: "解释是系统问题", hint: "能力+ 领导-", effect: { ability: 3, leader: -4 } },
        { label: "找同事联名说明", hint: "关系+ 领导-", effect: { relation: 5, leader: -6 } }
      ]
    },
    
    /* ==================== 婚礼随份子 ==================== */
    { id: "wedding_invite", stage: "any", type: "life", weight: 6, scene: "wedding",
      text: "朋友/同事结婚，请你参加婚礼。<br><span class='os'>（份子钱躲不掉。）</span>",
      choices: [
        { label: "随 888，去参加", hint: "储蓄- 关系++", effect: { savings: -888, relation: 8, mood: 3 } },
        { label: "随 500，意思一下", hint: "储蓄- 关系+", effect: { savings: -500, relation: 3 } },
        { label: "找借口不去", hint: "关系- 储蓄+", effect: { relation: -6 } }
      ]
    },
    
    ];