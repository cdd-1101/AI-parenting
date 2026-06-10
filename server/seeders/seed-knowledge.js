/**
 * 知识库种子数据
 * 用法: node seeders/seed-knowledge.js [--reset]
 * 
 * --reset: 清空现有知识库后重新插入
 * 不带参数: 仅插入缺失的数据（按 month+section 去重）
 */
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const shouldReset = process.argv.includes('--reset')

// 知识库数据（0-12 月龄 × 6 板块）
const knowledgeData = [
  // === 0月龄 ===
  { month: 0, section: 'growth', title: '新生儿体格发育', summary: '新生儿体重2.5-4kg，身长47-53cm，头围约34cm', details: '出生后2-3天会有生理性体重下降（不超过出生体重的10%），7-10天恢复到出生体重。满月时体重增加约1kg，身长增加约4-5cm。', tip: '建议每周称重一次，关注体重增长趋势' },
  { month: 0, section: 'feeding', title: '新生儿喂养指南', summary: '母乳是最佳食物，建议按需喂养', details: '出生后30分钟内开始早接触、早吸吮。母乳喂养每天8-12次，每次15-20分钟。初乳（金黄色）富含抗体，非常珍贵。', tip: '判断吃饱：每天6次以上湿尿布，体重稳定增长' },
  { month: 0, section: 'sleep', title: '新生儿睡眠', summary: '每天睡眠16-18小时，昼夜不分', details: '睡眠周期约45-60分钟，以浅睡眠为主。仰卧是最安全的睡姿。不需要枕头，床垫要硬实。', tip: '新生儿不需要刻意叫醒喂奶，除非体重增长不理想' },
  { month: 0, section: 'milestone', title: '发育里程碑', summary: '能短暂注视人脸，对声音有反应', details: '出生即可看到宝宝短暂的凝视，能感知妈妈的气味。惊跳反射（莫罗反射）是正常的原始反射。', tip: '多与宝宝面对面交流，有助于大脑发育' },
  { month: 0, section: 'health', title: '健康护理', summary: '脐带护理是重点，注意黄疸观察', details: '脐带残端7-14天脱落，保持干燥清洁。生理性黄疸2-3天出现，7-14天消退。如果皮肤/眼白发黄加重，及时就医。', tip: '脐带脱落前可擦浴，脱落后可以盆浴' },
  { month: 0, section: 'emotion', title: '情感发展', summary: '通过哭声表达需求，建立安全感很重要', details: '新生儿主要通过哭来沟通。及时回应不会"宠坏"宝宝，反而有助于建立安全依恋。触觉是最早发展的感觉。', tip: '多抱、多抚触，让宝宝感受到爱与安全' },

  // === 1月龄 ===
  { month: 1, section: 'growth', title: '1月龄体格发育', summary: '体重增长约1kg，身长增长3-4cm', details: '满月体检时医生会评估头围、身长、体重。男宝宝通常比女宝宝略重。', tip: '每次体检记录数据，关注增长曲线趋势' },
  { month: 1, section: 'feeding', title: '1月龄喂养', summary: '喂奶间隔逐渐规律，约每2-3小时一次', details: '母乳喂养仍然按需，但宝宝吃奶效率提高，每次时间可能缩短。配方奶每次约90-120ml。', tip: '注意拍嗝，减少吐奶和胀气' },
  { month: 1, section: 'sleep', title: '1月龄睡眠', summary: '每天睡眠15-16小时，开始区分昼夜', details: '白天清醒时间逐渐增加，夜间睡眠时间延长。可以开始建立简单的睡眠仪式。', tip: '白天保持适度光线和声音，夜间保持安静昏暗' },
  { month: 1, section: 'milestone', title: '1月龄发育里程碑', summary: '能抬头片刻，开始有社交性微笑', details: '趴着时能短暂抬头。听到声音会转头。开始有意识地微笑（不是反射性的）。', tip: '每天做短暂的趴着练习(tummy time)，锻炼颈部' },
  { month: 1, section: 'health', title: '1月龄健康', summary: '注意湿疹预防和维生素D补充', details: '纯母乳喂养的宝宝每天需要补充400IU维生素D。湿疹常见于面颊和头皮，保持皮肤湿润很重要。', tip: '洗澡水温37-38°C，洗后及时涂保湿霜' },
  { month: 1, section: 'emotion', title: '1月龄情感', summary: '社交微笑出现，眼神交流增多', details: '宝宝开始用微笑回应你的笑脸。能识别妈妈的声音和气味。目光追随移动的物体。', tip: '多对宝宝微笑、说话、唱歌' },

  // === 2月龄 ===
  { month: 2, section: 'growth', title: '2月龄体格发育', summary: '体重约5-6kg，身高约57-59cm', details: '头围每月增长约1cm。体型看起来更加圆润可爱。', tip: '生长曲线比单次数值更重要' },
  { month: 2, section: 'feeding', title: '2月龄喂养', summary: '喂奶间隔延长至3-4小时', details: '每次奶量约120-150ml。有些宝宝会出现猛长期，频繁要吃奶。', tip: '猛长期通常持续2-3天，多喂即可' },
  { month: 2, section: 'sleep', title: '2月龄睡眠', summary: '夜间连续睡眠可达4-5小时', details: '总睡眠约14-16小时。开始出现更长的清醒期。', tip: '可以开始建立固定的睡前流程' },
  { month: 2, section: 'milestone', title: '2月龄发育里程碑', summary: '能发出"咕咕"声，双手可以握住物品', details: '头部控制更好，趴着时能抬头45度。能追踪移动的物体。', tip: '用彩色玩具在宝宝面前慢慢移动，锻炼追视' },
  { month: 2, section: 'health', title: '2月龄健康', summary: '肠绞痛高发期，注意腹部按摩', details: '肠绞痛通常在2-3周开始，6周左右最严重，3-4个月后缓解。飞机抱、腹部按摩可缓解。', tip: '顺时针按摩肚子，做蹬自行车动作排气' },
  { month: 2, section: 'emotion', title: '2月龄情感', summary: '能辨别主要照顾者，表达更丰富', details: '对熟悉的人笑得更多，出现不同的哭声表达不同需求。', tip: '及时回应宝宝的"对话"，培养沟通意愿' },

  // === 3月龄 ===
  { month: 3, section: 'growth', title: '3月龄体格发育', summary: '体重约6-7kg，身高约60-62cm', details: '前3个月体重增长最快，平均每天增重25-30g。', tip: '如果体重增长缓慢，及时咨询医生' },
  { month: 3, section: 'feeding', title: '3月龄喂养', summary: '奶量稳定，每天约6-8次', details: '每次奶量约150-180ml。母乳喂养的宝宝可能开始对周围更感兴趣，容易分心。', tip: '在安静环境喂奶，减少干扰' },
  { month: 3, section: 'sleep', title: '3月龄睡眠', summary: '白天小睡3-4次，夜间可连续睡6小时', details: '睡眠规律开始建立。总睡眠约14-15小时。', tip: '观察宝宝的犯困信号：揉眼睛、打哈欠、眼神呆滞' },
  { month: 3, section: 'milestone', title: '3月龄发育里程碑', summary: '能稳定抬头，发出更多声音', details: '趴着时能抬头90度，用手支撑上身。能发出更多元音。开始玩手。', tip: '每天给宝宝俯卧时间，增强上肢力量' },
  { month: 3, section: 'health', title: '3月龄健康', summary: '接种疫苗后注意观察反应', details: '2-3月龄需要接种百白破、脊灰等疫苗。接种后可能有轻微发热、嗜睡。', tip: '接种后30分钟在医院观察，回家后多喂水' },
  { month: 3, section: 'emotion', title: '3月龄情感', summary: '主动社交，喜欢被人逗玩', details: '看到人会兴奋，手脚舞动。开始出现"对话"式的咿呀声。', tip: '模仿宝宝的声音，进行"对话"互动' },

  // === 4月龄 ===
  { month: 4, section: 'growth', title: '4月龄体格发育', summary: '体重约6.5-8kg，身高约62-65cm', details: '出生时体重已经翻倍。生长速度略放缓，属于正常现象。', tip: '关注生长曲线，不必与其他宝宝比较' },
  { month: 4, section: 'feeding', title: '4月龄喂养', summary: '可以开始考虑辅食准备（6月龄添加）', details: '奶量每次约180-210ml。虽然对大人食物感兴趣，但消化系统尚未准备好接受辅食。', tip: '观察以下信号：能坐稳、对食物好奇、挺舌反射消失' },
  { month: 4, section: 'sleep', title: '4月龄睡眠', summary: '可能出现"睡眠倒退"，属于正常发育', details: '4月龄睡眠倒退是因为睡眠模式从新生儿模式转变为成人模式。通常持续2-6周。', tip: '坚持睡眠仪式，不要养成新的安抚习惯' },
  { month: 4, section: 'milestone', title: '4月龄发育里程碑', summary: '能翻身（前翻后），抓住物品放嘴里', details: '手眼协调能力增强。能认出远处的人。大笑出声。', tip: '提供安全的牙胶/玩具让宝宝探索' },
  { month: 4, section: 'health', title: '4月龄健康', summary: '口水增多是正常现象', details: '唾液腺发育成熟，口水增多不代表长牙。注意下巴和颈部保持干燥，防止口水疹。', tip: '围上口水巾，及时擦拭' },
  { month: 4, section: 'emotion', title: '4月龄情感', summary: '开始认生，对陌生人表现出警惕', details: '能分辨主要照顾者和陌生人。对镜子里的自己好奇。', tip: '不要强迫宝宝接触陌生人' },

  // === 5月龄 ===
  { month: 5, section: 'growth', title: '5月龄体格发育', summary: '体重约7-9kg，身高约64-67cm', details: '男宝宝通常比女宝宝略重、略高。', tip: '5月龄体重约为出生时的两倍' },
  { month: 5, section: 'feeding', title: '5月龄喂养', summary: '奶量稳定，为辅食添加做准备', details: '每天奶量约800-1000ml。如果宝宝表现出对食物的强烈兴趣，可以咨询医生是否提前添加。', tip: '让宝宝看你吃饭，培养进食兴趣' },
  { month: 5, section: 'sleep', title: '5月龄睡眠', summary: '白天2-3次小睡，夜间睡眠10-12小时', details: '大部分宝宝可以在不夜奶的情况下睡整夜。如果夜醒频繁，考虑是否形成了睡眠关联。', tip: '尝试"吃-玩-睡"的EASY模式' },
  { month: 5, section: 'milestone', title: '5月龄发育里程碑', summary: '能靠坐，双手协调性增强', details: '可以从俯卧翻到仰卧。能抓住脚放嘴里。对因果关系有初步认知（摇铃→响声）。', tip: '提供不同质地的玩具让宝宝触摸' },
  { month: 5, section: 'health', title: '5月龄健康', summary: '注意安全防护，宝宝越来越活跃', details: '翻身、抓握能力增强，不要将宝宝放在高处无人看管。', tip: '检查家中是否有安全隐患' },
  { month: 5, section: 'emotion', title: '5月龄情感', summary: '分离焦虑萌芽，喜欢与照顾者互动', details: '宝宝可能会在照顾者离开时表现出不安。喜欢躲猫猫游戏。', tip: '离开时和宝宝说"拜拜"，建立分离的仪式感' },

  // === 6月龄 ===
  { month: 6, section: 'growth', title: '6月龄体格发育', summary: '体重约7.5-9.5kg，身高约66-69cm', details: '半岁体检很重要，医生会全面评估发育情况。', tip: '6月龄体检时可咨询辅食添加方案' },
  { month: 6, section: 'feeding', title: '6月龄辅食添加', summary: '正式开启辅食之旅！从含铁米粉开始', details: '第一口辅食推荐强化铁米粉。每次1-2勺，逐渐增加。辅食应在两顿奶之间添加。', tip: '每次只添加一种新食物，观察3天有无过敏' },
  { month: 6, section: 'sleep', title: '6月龄睡眠', summary: '睡眠规律基本建立', details: '白天通常2-3次小睡，每次1-2小时。总睡眠约13-15小时。', tip: '固定的睡眠仪式帮助宝宝入睡' },
  { month: 6, section: 'milestone', title: '6月龄发育里程碑', summary: '能独坐，开始发辅音', details: '可以不需要支撑坐稳。能发出ba、ma等音节。可以传递物品。', tip: '多和宝宝对话，鼓励发音' },
  { month: 6, section: 'health', title: '6月龄健康', summary: '出牙信号：流口水、咬东西、烦躁', details: '第一颗牙通常在下门牙。出牙期可能影响睡眠和食欲。可以用冰过的牙胶缓解。', tip: '出牙后开始用纱布清洁牙齿' },
  { month: 6, section: 'emotion', title: '6月龄情感', summary: '对主要照顾者有明显依恋', details: '分离焦虑可能加重。喜欢互动游戏，如拍手、唱歌。', tip: '高质量的亲子互动比玩具更重要' },

  // === 7月龄 ===
  { month: 7, section: 'growth', title: '7月龄体格发育', summary: '体重约8-10kg，身高约67-70cm', details: '增长幅度继续放缓，但活动量增加，体型可能变得更结实。', tip: '只要生长曲线正常，不必焦虑' },
  { month: 7, section: 'feeding', title: '7月龄喂养', summary: '辅食种类逐渐丰富', details: '可以添加蔬菜泥、水果泥、蛋黄。每天1-2顿辅食。注意食物要细腻。', tip: '逐步引入不同口味，预防挑食' },
  { month: 7, section: 'sleep', title: '7月龄睡眠', summary: '白天2次小睡，夜间可能有出牙夜醒', details: '出牙可能导致夜间频繁醒来。保持固定的入睡方式，避免形成新的睡眠关联。', tip: '白天增加活动量，有助于夜间睡眠' },
  { month: 7, section: 'milestone', title: '7月龄发育里程碑', summary: '开始爬行，理解"不"的意思', details: '从匍匐前进到手膝爬行。能理解简单的指令。开始认生。', tip: '提供安全的爬行空间，鼓励探索' },
  { month: 7, section: 'health', title: '7月龄健康', summary: '注意爬行安全，预防跌落', details: '宝宝活动范围增大，需要做好家居安全防护。窗户加装防护栏，楼梯加装安全门。', tip: '以宝宝的视角检查家中安全隐患' },
  { month: 7, section: 'emotion', title: '7月龄情感', summary: '认生明显，依恋物可能出现', details: '宝宝可能会对某条毛巾、毛绒玩具产生依恋。这是自我安抚的表现。', tip: '尊重宝宝对依恋物的需求' },

  // === 8月龄 ===
  { month: 8, section: 'growth', title: '8月龄体格发育', summary: '体重约8-10.5kg，身高约68-71cm', details: '爬行消耗大量热量，体重增长可能放缓。', tip: '保持均衡营养，奶量仍然重要' },
  { month: 8, section: 'feeding', title: '8月龄喂养', summary: '辅食从泥状过渡到碎末状', details: '可以添加肉泥、鱼泥、面条碎。每天2-3顿辅食。可以引入手指食物。', tip: '让宝宝尝试自己进食，锻炼手眼协调' },
  { month: 8, section: 'sleep', title: '8月龄睡眠', summary: '白天2次小睡，可能有"8月龄睡眠倒退"', details: '分离焦虑和运动发育可能导致睡眠波动。这是暂时的。', tip: '保持一致的睡眠流程，不要过度改变' },
  { month: 8, section: 'milestone', title: '8月龄发育里程碑', summary: '能扶站，用手指捏取小物件', details: '精细运动发展：能用拇指和食指捏取物品（钳形抓握）。理解物体恒存。', tip: '提供小颗粒安全玩具锻炼手指灵活性' },
  { month: 8, section: 'health', title: '8月龄健康', summary: '注意饮食安全，防止噎食', details: '手指食物要切成适合的大小。避免整颗葡萄、坚果等窒息风险食物。', tip: '学习婴儿急救方法（拍背法）' },
  { month: 8, section: 'emotion', title: '8月龄情感', summary: '分离焦虑高峰期', details: '宝宝可能会紧紧粘着主要照顾者，见到陌生人会哭。这是正常的发育阶段。', tip: '短暂分离后一定要回来，建立信任感' },

  // === 9月龄 ===
  { month: 9, section: 'growth', title: '9月龄体格发育', summary: '体重约8.5-11kg，身高约69-72cm', details: '宝宝的体型开始从"婴儿型"向"幼儿型"转变。', tip: '关注身高体重比例，而非绝对数值' },
  { month: 9, section: 'feeding', title: '9月龄喂养', summary: '一日三餐辅食+奶', details: '辅食可以更加多样化，包括粥、面条、蒸蛋等。可以加入少量食用油和盐。', tip: '建立固定的用餐时间和地点' },
  { month: 9, section: 'sleep', title: '9月龄睡眠', summary: '睡眠趋于稳定', details: '大部分宝宝白天2次小睡。有些宝宝开始从2次过渡到1次。', tip: '如果白天小睡变短，可能需要调整' },
  { month: 9, section: 'milestone', title: '9月龄发育里程碑', summary: '能扶走，开始模仿声音和动作', details: '能扶着家具移动。会说"爸爸""妈妈"（可能还不具有指向性）。能模仿拍手。', tip: '多和宝宝玩模仿游戏' },
  { month: 9, section: 'health', title: '9月龄健康', summary: '注意口腔卫生', details: '已有几颗牙齿的宝宝，每次进食后可以用湿纱布或指套牙刷清洁。', tip: '建立口腔清洁的习惯，减少龋齿风险' },
  { month: 9, section: 'emotion', title: '9月龄情感', summary: '有自我意识萌芽', details: '宝宝开始理解自己是独立的个体。会表达自己的意愿（如推开不想要的东西）。', tip: '在安全范围内，尊重宝宝的自主选择' },

  // === 10月龄 ===
  { month: 10, section: 'growth', title: '10月龄体格发育', summary: '体重约9-11.5kg，身高约70-74cm', details: '活动量增大，体型更加结实。', tip: '注意营养均衡，保证蛋白质摄入' },
  { month: 10, section: 'feeding', title: '10月龄喂养', summary: '辅食成为主要营养来源之一', details: '每天3顿辅食+2-3次奶。可以尝试家庭餐（少油少盐）。鼓励用杯子喝水。', tip: '让宝宝参与家庭用餐，培养饮食习惯' },
  { month: 10, section: 'sleep', title: '10月龄睡眠', summary: '白天1-2次小睡', details: '部分宝宝开始从2次小睡过渡到1次。如果上午小睡消失，下午小睡可能提前。', tip: '过渡期可能影响情绪，多给予安抚' },
  { month: 10, section: 'milestone', title: '10月龄发育里程碑', summary: '能独站片刻，理解简单指令', details: '可以不扶东西站立几秒。能理解"给我""不要"等简单指令。开始有意识地用手指物。', tip: '用简单的词汇描述日常活动' },
  { month: 10, section: 'health', title: '10月龄健康', summary: '预防缺铁性贫血', details: '保证含铁食物的摄入（红肉、蛋黄、强化谷物）。必要时进行血红蛋白检查。', tip: '搭配维生素C丰富的食物促进铁吸收' },
  { month: 10, section: 'emotion', title: '10月龄情感', summary: '社交技能增强，有幽默感', details: '会故意做某事来引起你的反应。喜欢互动游戏，如"拍手歌"。', tip: '多玩互动性强的游戏' },

  // === 11月龄 ===
  { month: 11, section: 'growth', title: '11月龄体格发育', summary: '体重约9-12kg，身高约71-75cm', details: '接近一岁了，体重约为出生时的3倍。', tip: '1岁前最后一次全面评估' },
  { month: 11, section: 'feeding', title: '11月龄喂养', summary: '向家庭饮食过渡', details: '可以添加几乎所有食物（除蜂蜜、整颗坚果、高糖高盐食品）。开始学习用勺子自己吃。', tip: '接受宝宝的"脏乱"进食，这是学习过程' },
  { month: 11, section: 'sleep', title: '11月龄睡眠', summary: '大部分宝宝白天1次小睡', details: '下午小睡约1.5-2小时。夜间睡眠10-12小时。', tip: '如果仍然2次小睡，不必强求转变' },
  { month: 11, section: 'milestone', title: '11月龄发育里程碑', summary: '能独走几步，有意识叫"爸爸""妈妈"', details: '开始尝试走路。能有意识地称呼父母。理解简单的指令并执行。', tip: '不要急于让宝宝走路，每个孩子有自己的节奏' },
  { month: 11, section: 'health', title: '11月龄健康', summary: '预防跌倒，鼓励运动', details: '学步期容易磕碰。保持地面整洁，移除障碍物。穿防滑袜或学步鞋。', tip: '跌倒是正常的，不要过度保护' },
  { month: 11, section: 'emotion', title: '11月龄情感', summary: '有明确偏好，表达"不要"', details: '宝宝会用摇头、推开等方式表达拒绝。这是自主性的发展，值得鼓励。', tip: '给宝宝提供2个选择，尊重其决定' },

  // === 12月龄 ===
  { month: 12, section: 'growth', title: '12月龄体格发育', summary: '体重约9-12.5kg，身高约72-76cm', details: '一岁生日！体重约为出生时的3倍，身长约为出生时的1.5倍。', tip: '1岁体检很重要，医生会全面评估发育情况' },
  { month: 12, section: 'feeding', title: '12月龄喂养', summary: '可以引入鲜牛奶，向完全家庭饮食过渡', details: '1岁后可以引入全脂鲜牛奶（每天不超过500ml）。一日三餐+2次加餐。', tip: '保持饮食多样化，避免偏食' },
  { month: 12, section: 'sleep', title: '12月龄睡眠', summary: '白天1次小睡，夜间10-12小时', details: '总睡眠约12-14小时。有些宝宝开始尝试放弃小睡。', tip: '即使不睡，也可以安排安静的休息时间' },
  { month: 12, section: 'milestone', title: '12月龄发育里程碑', summary: '能独走，说2-3个词', details: '大部分宝宝能独立行走。能说出2-3个有意义的词。会用手指物表达需求。', tip: '鼓励宝宝用语言表达，而非手势' },
  { month: 12, section: 'health', title: '12月龄健康', summary: '1岁体检 + 疫苗接种', details: '1岁需要接种麻腮风、水痘等疫苗。进行全面体检，包括视力、听力筛查。', tip: '记录所有疫苗和体检结果' },
  { month: 12, section: 'emotion', title: '12月龄情感', summary: '建立独立人格的第一步', details: '宝宝已经有明确的个性和偏好。开始理解规则和边界。', tip: '用正面引导代替"不要"，如"我们这样做"' }
]

async function main() {
  console.log(`${shouldReset ? '🔄' : '🌱'} 知识库种子数据填充\n`)

  if (shouldReset) {
    console.log('  清空现有知识库...')
    await prisma.knowledgeBase.deleteMany()
    console.log('  ✅ 已清空\n')
  }

  let inserted = 0
  let skipped = 0

  for (const item of knowledgeData) {
    if (!shouldReset) {
      // 检查是否已存在
      const existing = await prisma.knowledgeBase.findFirst({
        where: { month: item.month, section: item.section }
      })
      if (existing) {
        skipped++
        continue
      }
    }

    await prisma.knowledgeBase.create({ data: item })
    inserted++
  }

  console.log(`  ✅ 新增: ${inserted} 条`)
  console.log(`  ⏭  跳过: ${skipped} 条`)

  // 统计
  const total = await prisma.knowledgeBase.count()
  console.log(`\n📊 知识库总计: ${total} 条`)

  const months = await prisma.knowledgeBase.findMany({
    select: { month: true },
    distinct: ['month'],
    orderBy: { month: 'asc' }
  })
  console.log(`📅 覆盖月龄: ${months.map(m => m.month).join(', ')} 月龄`)
}

main()
  .catch(err => {
    console.error('❌ 填充失败:', err.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
