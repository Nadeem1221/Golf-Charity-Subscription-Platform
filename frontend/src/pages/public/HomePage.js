import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Target, Heart, ArrowRight, Star, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react';
import api from '../../utils/api';

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function HomePage() {
  const [featuredCharities, setFeaturedCharities] = useState([]);
  const [latestDraw, setLatestDraw] = useState(null);

  useEffect(() => {
    api.get('/charities?featured=true&limit=3').then(({ data }) => {
      if (data.success) setFeaturedCharities(data.charities);
    });
    api.get('/draws/latest').then(({ data }) => {
      if (data.success) setLatestDraw(data.draw);
    });
  }, []);

  return (
    <div className="home-page" style={{ overflowX: 'hidden' }}>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="hero" style={{ position: 'relative', minHeight: '75vh', display: 'flex', alignItems: 'center', padding: 'clamp(2rem, 5vh, 4rem) 1.25rem 4rem' }}>
        {/* Decorative ambient gradients */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(234,179,8,0.08) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(34,163,83,0.12) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <motion.div 
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}
        >
          <motion.div variants={fadeInUp} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '999px', color: 'var(--gold400)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '2rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <Sparkles size={16} /> <span>The premium golf charity platform</span>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', lineHeight: 1.05, marginBottom: '1.5rem', fontFamily: 'var(--fd)', textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
            Play Golf. <br/>
            <span style={{ background: 'linear-gradient(135deg, var(--gold300), var(--gold500), var(--gold700))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Win Prizes.</span> <br/>
            Change Lives.
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="hero-sub" style={{ fontSize: '1.15rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2.5rem', color: 'var(--txt2)' }}>
            Subscribe, enter your Stableford scores, and participate in monthly prize draws — all while supporting a charity you care about.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="hero-cta" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/subscribe" className="btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem 2.5rem', fontSize: '1.1rem', boxShadow: '0 8px 32px rgba(234, 179, 8, 0.25)', borderRadius: '999px' }}>
                Get Started <ArrowRight size={20} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/how-it-works" className="btn-secondary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem 2.5rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', borderRadius: '999px', borderColor: 'var(--borderB)' }}>
                How It Works
              </Link>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeInUp} style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'center', gap: '2.5rem', opacity: 0.7, fontSize: '0.9rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--txt2)' }}><ShieldCheck size={18} color="var(--gold400)" /> Secure Payments</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--txt2)' }}><Heart size={18} color="var(--gold400)" /> Verified Charities</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--txt2)' }}><Trophy size={18} color="var(--gold400)" /> Fair Draws</div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── How it works summary ─────────────────────── */}
      <motion.section 
        className="section"
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.h2 variants={fadeInUp} className="section-title">Three Simple Steps</motion.h2>
        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          
          <motion.div variants={fadeInUp} whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} className="step-card" style={{ position: 'relative', overflow: 'hidden', padding: '2.5rem 2rem', borderTop: '4px solid var(--gold500)', background: 'linear-gradient(180deg, var(--surface2) 0%, var(--surface) 100%)' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05, transform: 'rotate(15deg)' }}><Heart size={140} /></div>
            <div className="step-number" style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5, fontFamily: 'var(--fd)' }}>01</div>
            <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--txt)', marginBottom: '1rem' }}><Heart color="var(--gold500)" size={24}/> Subscribe</h3>
            <p style={{ fontSize: '1rem', color: 'var(--txt2)', lineHeight: 1.7 }}>Choose a monthly or yearly plan. A portion of every subscription goes straight to your chosen charity.</p>
          </motion.div>
          
          <motion.div variants={fadeInUp} whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} className="step-card" style={{ position: 'relative', overflow: 'hidden', padding: '2.5rem 2rem', borderTop: '4px solid var(--g400)', background: 'linear-gradient(180deg, var(--surface2) 0%, var(--surface) 100%)' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05, transform: 'rotate(-10deg)' }}><Target size={140} /></div>
            <div className="step-number" style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5, fontFamily: 'var(--fd)', background: 'linear-gradient(135deg, var(--g400), var(--g600))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>02</div>
            <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--txt)', marginBottom: '1rem' }}><Target color="var(--g400)" size={24}/> Enter Scores</h3>
            <p style={{ fontSize: '1rem', color: 'var(--txt2)', lineHeight: 1.7 }}>Log your latest 5 Stableford scores after each round. Your score history automatically updates.</p>
          </motion.div>
          
          <motion.div variants={fadeInUp} whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} className="step-card" style={{ position: 'relative', overflow: 'hidden', padding: '2.5rem 2rem', borderTop: '4px solid var(--gold400)', background: 'linear-gradient(180deg, var(--surface2) 0%, var(--surface) 100%)' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-20px', opacity: 0.05, transform: 'rotate(5deg)' }}><Trophy size={140} /></div>
            <div className="step-number" style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5, fontFamily: 'var(--fd)' }}>03</div>
            <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--txt)', marginBottom: '1rem' }}><Trophy color="var(--gold500)" size={24}/> Win Prizes</h3>
            <p style={{ fontSize: '1rem', color: 'var(--txt2)', lineHeight: 1.7 }}>Every month, five numbers are drawn. Match 3, 4, or all 5 of your scores to win a share of the prize pool.</p>
          </motion.div>
          
        </div>
      </motion.section>

      {/* ── Prize pool explainer ─────────────────────── */}
      <motion.section 
        className="section section-alt"
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        style={{ position: 'relative' }}
      >
        <motion.h2 variants={fadeInUp} className="section-title">Monthly Prize <span style={{ color: 'var(--gold400)' }}>Distribution</span></motion.h2>
        <div className="prize-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
          
          <motion.div variants={scaleIn} whileHover={{ scale: 1.03 }} className="prize-card prize-gold" style={{ border: 'none', background: 'linear-gradient(145deg, rgba(234, 179, 8, 0.1), rgba(0,0,0,0.4))', boxShadow: '0 10px 40px rgba(234,179,8,0.1)', padding: '3rem 2rem', borderRadius: 'var(--r28)' }}>
            <Trophy size={48} color="var(--gold400)" style={{ margin: '0 auto 1.5rem', filter: 'drop-shadow(0 0 10px rgba(234,179,8,0.5))' }} />
            <h3 style={{ fontSize: '1.4rem', color: 'var(--txt)', fontFamily: 'var(--fd)' }}>Jackpot! (5 Match)</h3>
            <p className="prize-percent" style={{ fontSize: '3.5rem', background: 'linear-gradient(to right, var(--gold300), var(--gold600))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '1rem 0' }}>40%</p>
            <p style={{ fontSize: '1.05rem', color: 'var(--txt2)' }}>of the prize pool. Rolls over to next month if unclaimed.</p>
          </motion.div>
          
          <motion.div variants={scaleIn} whileHover={{ scale: 1.03 }} className="prize-card prize-silver" style={{ border: 'none', background: 'linear-gradient(145deg, rgba(148, 163, 184, 0.1), rgba(0,0,0,0.4))', padding: '3rem 2rem', borderRadius: 'var(--r28)' }}>
            <Star size={40} color="#94a3b8" style={{ margin: '0 auto 1.5rem', filter: 'drop-shadow(0 0 10px rgba(148,163,184,0.3))' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--txt)', fontFamily: 'var(--fd)' }}>4-Number Match</h3>
            <p className="prize-percent" style={{ fontSize: '2.8rem', color: '#94a3b8', margin: '1rem 0' }}>35%</p>
            <p style={{ fontSize: '1rem', color: 'var(--txt2)' }}>of the prize pool — split evenly between all winners.</p>
          </motion.div>
          
          <motion.div variants={scaleIn} whileHover={{ scale: 1.03 }} className="prize-card prize-bronze" style={{ border: 'none', background: 'linear-gradient(145deg, rgba(251, 146, 60, 0.1), rgba(0,0,0,0.4))', padding: '3rem 2rem', borderRadius: 'var(--r28)' }}>
            <CheckCircle size={40} color="#fb923c" style={{ margin: '0 auto 1.5rem', filter: 'drop-shadow(0 0 10px rgba(251,146,60,0.3))' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--txt)', fontFamily: 'var(--fd)' }}>3-Number Match</h3>
            <p className="prize-percent" style={{ fontSize: '2.8rem', color: '#fb923c', margin: '1rem 0' }}>25%</p>
            <p style={{ fontSize: '1rem', color: 'var(--txt2)' }}>of the prize pool — split evenly between all winners.</p>
          </motion.div>
          
        </div>
      </motion.section>

      {/* ── Latest draw ──────────────────────────────── */}
      {latestDraw && (
        <motion.section 
          className="section"
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div style={{ background: 'linear-gradient(180deg, var(--surface2) 0%, var(--surface) 100%)', padding: '4rem 2rem', borderRadius: 'var(--r28)', border: '1px solid var(--border)', textAlign: 'center', boxShadow: 'var(--shL)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, var(--g400), var(--gold500))' }} />
            
            <h2 className="section-title" style={{ marginBottom: '2.5rem' }}>Latest Draw — <span style={{ color: 'var(--gold400)' }}>{latestDraw.name}</span></h2>
            
            <div className="draw-result-preview" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="drawn-numbers" style={{ justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                {latestDraw.drawnNumbers.map((n, i) => (
                  <motion.span 
                    key={i} 
                    className="drawn-ball drawn-ball-lg" 
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: i * 0.1 }}
                    style={{ background: 'linear-gradient(135deg, var(--gold400), var(--gold700))', color: 'var(--g900)', border: 'none', boxShadow: '0 10px 20px rgba(234,179,8,0.3)' }}
                  >
                    {n}
                  </motion.span>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--r14)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--txtM)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Participants</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--txt)', fontFamily: 'var(--fd)' }}>{latestDraw.participantCount}</div>
                </div>
                <div style={{ width: '1px', background: 'var(--border)' }} />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--txtM)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Prize Pool</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--gold400)', fontFamily: 'var(--fd)' }}>${(latestDraw.totalPrizePool / 100).toFixed(2)}</div>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ display: 'inline-block' }}>
                <Link to="/dashboard/draws" className="btn-secondary btn-lg" style={{ borderRadius: '999px', padding: '0.8rem 2.5rem', background: 'rgba(255,255,255,0.05)', borderColor: 'var(--gold500)' }}>View All Draws</Link>
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}

      {/* ── Featured charities ───────────────────────── */}
      {featuredCharities.length > 0 && (
        <motion.section 
          className="section section-alt"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>Supporting <span style={{ color: 'var(--gold400)' }}>Great Causes</span></h2>
            <p style={{ color: 'var(--txt2)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>A minimum of 10% from every subscription goes directly to a verified charity of your choice.</p>
          </motion.div>

          <div className="charity-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {featuredCharities.map((charity) => (
              <motion.div 
                key={charity._id} 
                className="charity-card" 
                variants={fadeInUp}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', borderColor: 'var(--gold500)' }}
                style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(to bottom, var(--surface2), var(--surface))', borderRadius: 'var(--r20)' }}
              >
                {charity.logo ? (
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#fff', padding: '5px', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                    <img src={charity.logo} alt={charity.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                  </div>
                ) : (
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--g700)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--txt2)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                    <Heart size={40} />
                  </div>
                )}
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--fd)', color: 'var(--txt)' }}>{charity.name}</h3>
                <p style={{ color: 'var(--txtM)', marginBottom: '2.5rem', lineHeight: 1.6, flex: 1 }}>{charity.shortDescription || charity.description?.slice(0, 120)}...</p>
                
                <Link to={`/charities/${charity._id}`} className="btn-secondary" style={{ width: '100%', borderRadius: '999px', padding: '0.8rem' }}>Learn More</Link>
              </motion.div>
            ))}
          </div>
          <motion.div variants={fadeInUp} className="section-cta" style={{ marginTop: '4rem' }}>
            <Link to="/charities" className="btn-link" style={{ fontSize: '1.1rem', paddingBottom: '4px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>View All Charities <ArrowRight size={18} /></Link>
          </motion.div>
        </motion.section>
      )}

      {/* ── CTA Banner ───────────────────────────────── */}
      <motion.section 
        className="cta-banner"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={fadeInUp}
        style={{ padding: '6rem 2rem', background: 'linear-gradient(135deg, var(--g900), var(--g800), var(--g900))', position: 'relative' }}
      >
        <div style={{ position: 'absolute', inset: 0, opacity: 0.5, background: 'radial-gradient(circle at center, rgba(234,179,8,0.1) 0%, transparent 70%)' }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: 'inline-block', marginBottom: '2rem' }}
          >
            <Trophy size={64} color="var(--gold400)" style={{ filter: 'drop-shadow(0 0 20px rgba(234,179,8,0.4))' }} />
          </motion.div>
          
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontFamily: 'var(--fd)', marginBottom: '1.5rem', color: 'var(--txt)' }}>Ready to make a difference?</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--txt2)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.6 }}>Join the community today. Your subscription funds a cause you care about while giving you the chance to win big.</p>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ display: 'inline-block' }}>
            <Link to="/subscribe" className="btn-primary btn-lg" style={{ fontSize: '1.2rem', padding: '1.2rem 3.5rem', borderRadius: '999px', boxShadow: '0 10px 30px rgba(234, 179, 8, 0.3)' }}>
              Subscribe Now
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
