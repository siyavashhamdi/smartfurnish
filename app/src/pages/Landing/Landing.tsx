import {
  useCallback,
  useMemo,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AutoAwesomeRounded,
  MenuBookRounded,
  PersonRounded,
  PhotoCameraRounded,
  PlayCircleOutlineRounded,
  SecurityRounded,
  SupportAgentRounded,
  VerifiedUserRounded,
} from "@mui/icons-material";
import { Box, Button, Skeleton, Typography } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { API_CONFIG } from "../../config";
import { usePageSeoOverride } from "../../hooks/usePageSeoOverride";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { useTranslation } from "../../hooks/useTranslation";
import { APP_SHELL_ROUTES } from "../../routing/app-shell-routes";
import {
  buildDefaultStructuredData,
  buildStructuredDataLogoUrl,
} from "../../seo/build-structured-data";
import { resolveAppBaseUrl } from "../../seo/build-page-seo";
import { buildSeoDescription, resolveAbsoluteUrl } from "../../seo/seo-text.util";
import EnamadTrustSeal from "../../shared/EnamadTrustSeal";
import ProductCard from "../Products/ProductCard";
import { useLandingFeaturedProducts } from "./useLandingFeaturedProducts";
import styles from "./styles/landing.module.scss";

const FEATURED_PRODUCT_COUNT = 3;

type RevealSectionProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly delay?: number;
  readonly id?: string;
};

const RevealSection = ({
  children,
  className,
  delay = 0,
  id,
}: RevealSectionProps): ReactElement => {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <Box
      ref={ref}
      id={id}
      component="section"
      className={[styles.reveal, isVisible ? styles.revealVisible : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Box>
  );
};

type SectionHeaderProps = {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly centered?: boolean;
};

const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  centered = true,
}: SectionHeaderProps): ReactElement => (
  <Box className={[styles.sectionHeader, centered ? styles.sectionHeaderCentered : ""].join(" ")}>
    <Typography component="p" className={styles.sectionEyebrow}>
      {eyebrow}
    </Typography>
    <Typography variant="h3" component="h2" className={styles.sectionTitle}>
      {title}
    </Typography>
    <Typography variant="body1" className={styles.sectionSubtitle}>
      {subtitle}
    </Typography>
  </Box>
);

type NavCardProps = {
  readonly to: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly children: ReactNode;
};

const NavCard = ({ to, className, style, children }: NavCardProps): ReactElement => (
  <Box
    component={Link}
    to={to}
    className={[styles.navCard, className].filter(Boolean).join(" ")}
    style={style}
  >
    {children}
  </Box>
);

const Landing = (): ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { products: featuredProducts, loading: productsLoading } = useLandingFeaturedProducts();

  const pageSeoOverride = useMemo(() => {
    const appUrl = resolveAppBaseUrl(API_CONFIG.APP_URL);
    const canonicalPath = APP_SHELL_ROUTES.landing;
    const canonicalUrl = resolveAbsoluteUrl(appUrl, canonicalPath);
    const siteName = t("seo.brand.name");
    const description = buildSeoDescription(t("seo.pages.landing.description"));
    const logoUrl = buildStructuredDataLogoUrl(appUrl, "/icons/icon-512.png");

    return {
      title: t("app.pageTitles.landing"),
      description,
      canonicalPath,
      robots: t("seo.pages.landing.robots"),
      keywords: t("seo.pages.landing.keywords"),
      jsonLd: buildDefaultStructuredData({
        t,
        appUrl,
        canonicalUrl,
        siteName,
        description,
        logoUrl,
      }),
    };
  }, [t]);

  usePageSeoOverride(pageSeoOverride);

  const handleProductOpen = useCallback(
    (productId: string): void => {
      navigate(`${APP_SHELL_ROUTES.products}/${productId}`);
    },
    [navigate]
  );

  const handleProductKeyDown = useCallback(
    (productId: string, event: KeyboardEvent<HTMLElement>): void => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleProductOpen(productId);
      }
    },
    [handleProductOpen]
  );

  const primaryCtaLabel = isAuthenticated
    ? t("pages.landing.nav.myProducts")
    : t("pages.landing.hero.ctaPrimary");

  const featureItems = [
    {
      key: "products",
      to: APP_SHELL_ROUTES.products,
      icon: <MenuBookRounded />,
      title: t("pages.landing.features.items.products.title"),
      description: t("pages.landing.features.items.products.description"),
    },
    {
      key: "path",
      to: APP_SHELL_ROUTES.products,
      icon: <AutoAwesomeRounded />,
      title: t("pages.landing.features.items.path.title"),
      description: t("pages.landing.features.items.path.description"),
    },
    {
      key: "support",
      to: APP_SHELL_ROUTES.support,
      icon: <SupportAgentRounded />,
      title: t("pages.landing.features.items.support.title"),
      description: t("pages.landing.features.items.support.description"),
    },
    {
      key: "profile",
      to: APP_SHELL_ROUTES.profile,
      icon: <PersonRounded />,
      title: t("pages.landing.features.items.profile.title"),
      description: t("pages.landing.features.items.profile.description"),
    },
  ] as const;

  const stepItems = [
    {
      key: "signup",
      to: isAuthenticated ? APP_SHELL_ROUTES.profile : APP_SHELL_ROUTES.profileSignup,
      number: "۰۱",
      icon: <PersonRounded />,
      title: t("pages.landing.steps.items.signup.title"),
      description: t("pages.landing.steps.items.signup.description"),
    },
    {
      key: "browse",
      to: APP_SHELL_ROUTES.products,
      number: "۰۲",
      icon: <MenuBookRounded />,
      title: t("pages.landing.steps.items.browse.title"),
      description: t("pages.landing.steps.items.browse.description"),
    },
    {
      key: "learn",
      to: APP_SHELL_ROUTES.products,
      number: "۰۳",
      icon: <PhotoCameraRounded />,
      title: t("pages.landing.steps.items.learn.title"),
      description: t("pages.landing.steps.items.learn.description"),
    },
  ] as const;

  const trustItems = [
    {
      key: "privacy",
      to: APP_SHELL_ROUTES.morePrivacyPolicy,
      icon: <SecurityRounded />,
      title: t("pages.landing.trust.items.privacy.title"),
      description: t("pages.landing.trust.items.privacy.description"),
    },
    {
      key: "support",
      to: APP_SHELL_ROUTES.support,
      icon: <VerifiedUserRounded />,
      title: t("pages.landing.trust.items.support.title"),
      description: t("pages.landing.trust.items.support.description"),
    },
    {
      key: "more",
      to: APP_SHELL_ROUTES.more,
      icon: <PlayCircleOutlineRounded />,
      title: t("pages.landing.trust.items.more.title"),
      description: t("pages.landing.trust.items.more.description"),
    },
  ] as const;

  return (
    <Box className={[styles.page, styles.pageEmbedded].join(" ")} aria-label={t("app.pageTitles.landing")}>
      <Box component="main" className={styles.main}>
        <Box component="section" className={styles.hero} aria-labelledby="landing-hero-title">
          <Box className={styles.heroContent}>
            <Typography component="p" className={[styles.heroEyebrow, styles.fadeInUp].join(" ")}>
              {t("pages.landing.hero.eyebrow")}
            </Typography>

            <Typography
              id="landing-hero-title"
              variant="h2"
              component="h1"
              className={[styles.heroTitle, styles.fadeInUp, styles.fadeInUpDelay1].join(" ")}
            >
              {t("pages.landing.hero.title")}
            </Typography>

            <Typography
              variant="body1"
              className={[styles.heroSubtitle, styles.fadeInUp, styles.fadeInUpDelay2].join(" ")}
            >
              {t("pages.landing.hero.subtitle")}
            </Typography>

            <Box className={[styles.heroCtas, styles.fadeInUp, styles.fadeInUpDelay3].join(" ")}>
              <Button
                component={Link}
                to={APP_SHELL_ROUTES.products}
                variant="contained"
                size="large"
                className={styles.heroPrimaryButton}
              >
                {primaryCtaLabel}
              </Button>
              {!isAuthenticated ? (
                <Button
                  component={Link}
                  to={APP_SHELL_ROUTES.profileSignup}
                  variant="outlined"
                  size="large"
                  className={styles.heroSecondaryButton}
                >
                  {t("pages.landing.hero.ctaSecondary")}
                </Button>
              ) : null}
            </Box>

            <Box className={[styles.heroStats, styles.fadeInUp, styles.fadeInUpDelay4].join(" ")}>
              {[
                t("pages.landing.hero.stats.multimedia"),
                t("pages.landing.hero.stats.personalized"),
                t("pages.landing.hero.stats.support"),
              ].map((label) => (
                <Box key={label} className={styles.heroStat}>
                  <span className={styles.heroStatDot} aria-hidden />
                  <Typography component="span">{label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box className={styles.heroVisual} aria-hidden>
            <Box className={styles.heroCard}>
              <Box component="img" src="/logo.png" alt="" className={styles.heroCardLogo} />
              <Typography className={styles.heroCardBadge}>
                {t("pages.landing.hero.badge")}
              </Typography>
            </Box>
          </Box>
        </Box>

        <RevealSection id="features" className={styles.featuresSection}>
          <SectionHeader
            eyebrow={t("pages.landing.features.eyebrow")}
            title={t("pages.landing.features.title")}
            subtitle={t("pages.landing.features.subtitle")}
          />
          <Box className={styles.featureGrid}>
            {featureItems.map((item, index) => (
              <NavCard
                key={item.key}
                to={item.to}
                className={styles.featureCard}
                style={{ "--card-index": index } as React.CSSProperties}
              >
                <Box className={styles.featureIcon}>{item.icon}</Box>
                <Typography variant="h6" component="h3" className={styles.featureTitle}>
                  {item.title}
                </Typography>
                <Typography variant="body2" className={styles.featureDescription}>
                  {item.description}
                </Typography>
              </NavCard>
            ))}
          </Box>
        </RevealSection>

        <RevealSection id="steps" className={styles.stepsSection} delay={80}>
          <SectionHeader
            eyebrow={t("pages.landing.steps.eyebrow")}
            title={t("pages.landing.steps.title")}
            subtitle={t("pages.landing.steps.subtitle")}
          />
          <Box className={styles.stepsTrack}>
            {stepItems.map((step, index) => (
              <NavCard
                key={step.key}
                to={step.to}
                className={styles.stepCard}
                style={{ "--card-index": index } as React.CSSProperties}
              >
                <Typography className={styles.stepNumber}>{step.number}</Typography>
                <Box className={styles.stepIcon}>{step.icon}</Box>
                <Typography variant="h6" component="h3" className={styles.stepTitle}>
                  {step.title}
                </Typography>
                <Typography variant="body2" className={styles.stepDescription}>
                  {step.description}
                </Typography>
              </NavCard>
            ))}
          </Box>
        </RevealSection>

        <RevealSection id="products" className={styles.productsSection} delay={120}>
          <SectionHeader
            eyebrow={t("pages.landing.products.eyebrow")}
            title={t("pages.landing.products.title")}
            subtitle={t("pages.landing.products.subtitle")}
          />
          <Box className={styles.productGrid}>
            {productsLoading
              ? Array.from({ length: FEATURED_PRODUCT_COUNT }, (_, index) => (
                  <Skeleton
                    key={`product-skeleton-${index}`}
                    variant="rounded"
                    className={styles.productSkeleton}
                  />
                ))
              : null}
            {!productsLoading && featuredProducts.length === 0 ? (
              <Typography className={styles.productsEmpty}>
                {t("pages.landing.products.empty")}
              </Typography>
            ) : null}
            {!productsLoading
              ? featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    item={product}
                    variant="public"
                    coverImageAccessUrl={product.coverImageAccessUrl}
                    onOpen={() => handleProductOpen(product.id)}
                    onKeyDown={(event) => handleProductKeyDown(product.id, event)}
                  />
                ))
              : null}
          </Box>
          <Box className={styles.productsCta}>
            <Button
              component={Link}
              to={APP_SHELL_ROUTES.products}
              variant="outlined"
              size="large"
              className={styles.viewAllButton}
            >
              {t("pages.landing.products.viewAll")}
            </Button>
          </Box>
        </RevealSection>

        <RevealSection id="trust" className={styles.trustSection} delay={160}>
          <SectionHeader
            eyebrow={t("pages.landing.trust.eyebrow")}
            title={t("pages.landing.trust.title")}
            subtitle={t("pages.landing.trust.subtitle")}
          />
          <Box className={styles.trustGrid}>
            {trustItems.map((item, index) => (
              <NavCard
                key={item.key}
                to={item.to}
                className={styles.trustCard}
                style={{ "--card-index": index } as React.CSSProperties}
              >
                <Box className={styles.trustIcon}>{item.icon}</Box>
                <Typography variant="h6" component="h3">
                  {item.title}
                </Typography>
                <Typography variant="body2">{item.description}</Typography>
              </NavCard>
            ))}
          </Box>
          <Box className={styles.enamadWrap}>
            <EnamadTrustSeal />
          </Box>
        </RevealSection>

        <RevealSection className={styles.ctaSection} delay={200}>
          <Box className={styles.ctaCard}>
            <Typography variant="h4" component="h2" className={styles.ctaTitle}>
              {t("pages.landing.cta.title")}
            </Typography>
            <Typography variant="body1" className={styles.ctaSubtitle}>
              {t("pages.landing.cta.subtitle")}
            </Typography>
            <Box className={styles.ctaButtons}>
              <Button
                component={Link}
                to={APP_SHELL_ROUTES.products}
                variant="contained"
                size="large"
                className={styles.ctaPrimaryButton}
              >
                {t("pages.landing.cta.primary")}
              </Button>
              {!isAuthenticated ? (
                <Button
                  component={Link}
                  to={APP_SHELL_ROUTES.profileSignup}
                  variant="outlined"
                  size="large"
                  className={styles.ctaSecondaryButton}
                >
                  {t("pages.landing.cta.secondary")}
                </Button>
              ) : null}
            </Box>
          </Box>
        </RevealSection>
      </Box>
    </Box>
  );
};

export default Landing;
