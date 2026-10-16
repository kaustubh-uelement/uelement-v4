'use client';

import React, { useEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

export default function GlobalOperationsGlobe() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = chartRef.current;
    if (!container) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    // Create root element
    const root = am5.Root.new(container);

    // Remove amCharts logo/credit
    if (root._logo) {
      root._logo.dispose();
    }

    // Set themes
    const uelementTheme = am5.Theme.new(root);
    uelementTheme.rule('InterfaceColors').setAll({
      primaryButton: am5.color(0x8a6522),
      primaryButtonHover: am5.color(0x6e4f18),
      primaryButtonDown: am5.color(0x4a340e),
      primaryButtonActive: am5.color(0xc49a45),
      primaryButtonText: am5.color(0xf6f0e4),
      secondaryButton: am5.color(0xe3d6bb),
      secondaryButtonHover: am5.color(0xd4be9e),
      secondaryButtonDown: am5.color(0xc49a45),
      secondaryButtonText: am5.color(0x0e1b36),
      background: am5.color(0xe3d6bb),
      text: am5.color(0x0e1b36),
    });

    root.setThemes([am5themes_Animated.new(root), uelementTheme]);

    if (root._logo) {
      root._logo.dispose();
    }

    // UElement Gold & Ink palette matching our current UI design system
    const ink = am5.color(0x0e1b36);          // --ink: deep primary text
    const richGold = am5.color(0xc49a45);     // --gold: Core HQ / Sovereign Hubs
    const warmBronze = am5.color(0x8a6522);   // --gold-ink: Interconnect ribbons
    const goldSoft = am5.color(0xddbb6e);     // --gold-soft: Strategic Regional Centers
    const champagneTan = am5.color(0xe3d3b0); // Active Deployment Markets
    const creamLand = am5.color(0xf6f0e4);    // --paper: Base Country Landmass
    const landBorder = am5.color(0xd9cdb5);   // Land Border
    const oceanTint = am5.color(0xeae0ce);    // Warm ocean tint harmonious with --creme

    // India (Pune) target coordinates: rotationX = -75, rotationY = -20
    const INDIA_ROT_X = -75;
    const INDIA_ROT_Y = -20;

    // Create the map chart
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: 'rotateX',
        panY: isMobile ? 'none' : 'rotateY',
        wheelX: 'none',
        wheelY: 'none',
        pinchZoom: false,
        projection: am5map.geoOrthographic(),
        rotationX: INDIA_ROT_X,
        rotationY: INDIA_ROT_Y,
        minZoomLevel: 0.5,
        maxZoomLevel: 16,
        zoomLevel: isMobile ? 0.82 : 0.9,
      })
    );

    // Trackpad pinch-to-zoom handler
    const handleTrackpadPinch = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const currentZoom = chart.get('zoomLevel', 1);
        const factor = e.deltaY < 0 ? 1.05 : 0.95;
        const newZoom = Math.max(
          chart.get('minZoomLevel', 0.5),
          Math.min(chart.get('maxZoomLevel', 16), currentZoom * factor)
        );
        chart.set('zoomLevel', newZoom);
      }
    };
    container.addEventListener('wheel', handleTrackpadPinch, { passive: false });

    // Create series for globe sphere background fill (soft ocean tint)
    const bgSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
    bgSeries.mapPolygons.template.setAll({
      fill: oceanTint,
      fillOpacity: 0.55,
      strokeOpacity: 0,
    });
    bgSeries.data.push({
      geometry: am5map.getGeoRectangle(90, 180, -90, -180),
    });

    // Create graticule series
    const graticuleSeries = chart.series.push(
      am5map.GraticuleSeries.new(root, {})
    );
    graticuleSeries.mapLines.template.setAll({
      stroke: warmBronze,
      strokeOpacity: 0.15,
      strokeWidth: 0.5,
    });

    // Create main polygon series for countries
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
      })
    );
    polygonSeries.mapPolygons.template.setAll({
      fill: creamLand,
      stroke: landBorder,
      strokeWidth: 0.5,
      strokeOpacity: 0.5,
    });

    // Highlight hub and consumer countries
    const sovereignHubs = ['IN', 'AE', 'SG', 'US'];
    const strategicCenters = ['GB', 'DE', 'FR', 'AU', 'JP'];
    const activeDeployments = [
      'SA',
      'NL',
      'CA',
      'MY',
      'ZA',
      'VN',
      'DK',
      'BE',
      'MU',
      'SE',
      'IT',
      'AT',
      'PL',
    ];

    polygonSeries.events.on('datavalidated', function () {
      am5.array.each(polygonSeries.dataItems, function (di) {
        const id = di.get('id');
        if (id && sovereignHubs.includes(id as string)) {
          di.get('mapPolygon')?.setAll({ fill: richGold, stroke: warmBronze, strokeWidth: 0.8 });
        } else if (id && strategicCenters.includes(id as string)) {
          di.get('mapPolygon')?.setAll({ fill: goldSoft, stroke: warmBronze, strokeWidth: 0.7 });
        } else if (id && activeDeployments.includes(id as string)) {
          di.get('mapPolygon')?.setAll({ fill: champagneTan, stroke: landBorder, strokeWidth: 0.6 });
        }
      });
    });

    // Create Map Sankey Series with fine, delicate ribbon widths
    const sankeySeries = chart.series.push(
      am5map.MapSankeySeries.new(root, {
        polygonSeries: polygonSeries,
        maxWidth: 0.6,
        controlPointDistance: 0.38,
        resolution: 60,
        nodePadding: 0.05,
      })
    );

    sankeySeries.mapPolygons.template.setAll({
      fill: warmBronze,
      fillOpacity: 0.45,
      strokeOpacity: 0,
      tooltipText: '{sourceNode.name} ⟷ {targetNode.name}\n[#8a6522]Sovereign Interconnect[/]',
    });

    sankeySeries.nodes.mapPolygons.template.setAll({
      fill: richGold,
      stroke: am5.color(0xf6f0e4),
      strokeWidth: 1.2,
      fillOpacity: 0.98,
      strokeOpacity: 1,
      tooltipText: '{name}',
      shadowColor: ink,
      shadowBlur: 4,
      shadowOpacity: 0.25,
    });

    // Add animated photon bullet markers (compact size)
    sankeySeries.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationX: 0,
        autoRotate: true,
        sprite: am5.Circle.new(root, {
          radius: 2.2,
          fill: richGold,
          stroke: am5.color(0xffffff),
          strokeWidth: 0.8,
          shadowColor: richGold,
          shadowBlur: 4,
          shadowOpacity: 0.8,
          centerX: am5.p50,
          centerY: am5.p50,
          visible: false,
        }),
      });
    });

    // Interconnect network routes with balanced values
    sankeySeries.data.setAll([
      // Primary routes from Global HQ (Pune, India)
      { sourceId: 'IN', targetId: 'AE', value: 12 },
      { sourceId: 'IN', targetId: 'SG', value: 12 },
      { sourceId: 'IN', targetId: 'US', value: 12 },
      { sourceId: 'IN', targetId: 'GB', value: 10 },
      { sourceId: 'IN', targetId: 'DE', value: 10 },
      { sourceId: 'IN', targetId: 'FR', value: 10 },
      { sourceId: 'IN', targetId: 'AU', value: 10 },
      { sourceId: 'IN', targetId: 'JP', value: 10 },
      { sourceId: 'IN', targetId: 'SA', value: 10 },
      { sourceId: 'IN', targetId: 'NL', value: 8 },

      // Singapore Regional Synapses
      { sourceId: 'SG', targetId: 'MY', value: 8 },
      { sourceId: 'SG', targetId: 'VN', value: 8 },
      { sourceId: 'SG', targetId: 'AU', value: 8 },
      { sourceId: 'SG', targetId: 'JP', value: 8 },

      // UAE Regional Synapses
      { sourceId: 'AE', targetId: 'SA', value: 8 },
      { sourceId: 'AE', targetId: 'ZA', value: 8 },
      { sourceId: 'AE', targetId: 'MU', value: 6 },

      // US & European Synapses
      { sourceId: 'US', targetId: 'CA', value: 8 },
      { sourceId: 'US', targetId: 'GB', value: 8 },
      { sourceId: 'GB', targetId: 'NL', value: 6 },
      { sourceId: 'GB', targetId: 'DK', value: 6 },
      { sourceId: 'DE', targetId: 'AT', value: 6 },
      { sourceId: 'DE', targetId: 'PL', value: 6 },
      { sourceId: 'FR', targetId: 'IT', value: 6 },
      { sourceId: 'NL', targetId: 'BE', value: 6 },
      { sourceId: 'DK', targetId: 'SE', value: 6 },
    ]);

    // Set country names on auto-created nodes and animate bullets
    const countryNames: Record<string, string> = {
      IN: 'Pune · Global HQ',
      AE: 'UAE · Regional Hub',
      SG: 'Singapore · Regional Hub',
      US: 'United States',
      GB: 'United Kingdom',
      DE: 'Germany',
      FR: 'France',
      AU: 'Australia',
      JP: 'Japan',
      SA: 'Saudi Arabia',
      NL: 'Netherlands',
      CA: 'Canada',
      MY: 'Malaysia',
      ZA: 'South Africa',
      VN: 'Vietnam',
      DK: 'Denmark',
      BE: 'Belgium',
      MU: 'Mauritius',
      SE: 'Sweden',
      IT: 'Italy',
      AT: 'Austria',
      PL: 'Poland',
    };

    sankeySeries.events.on('datavalidated', function () {
      am5.array.each(sankeySeries.nodes.dataItems, function (di) {
        const id = di.get('id');
        if (id && countryNames[id as string]) {
          di.set('name', countryNames[id as string]);
        }

        // Clamp and reduce all node circle geometries to small, refined sizes
        const lon = di.get('longitude');
        const lat = di.get('latitude');
        const mapPolygon = di.get('mapPolygon');
        if (lon !== undefined && lat !== undefined && mapPolygon) {
          let nodeRadius = 0.95; // Default compact circle radius for all nodes
          if (id === 'IN') {
            nodeRadius = 1.35; // India (HQ): slightly highlighted but neat and compact
          } else if (['AE', 'SG', 'US'].includes(id as string)) {
            nodeRadius = 1.15; // Regional hubs
          }
          const compactCircle = am5map.getGeoCircle(
            { longitude: lon, latitude: lat },
            nodeRadius
          );
          mapPolygon.set('geometry', compactCircle);
        }
      });

      am5.array.each(sankeySeries.dataItems, function (dataItem) {
        const bullets = dataItem.bullets;
        if (bullets) {
          am5.array.each(bullets, function (bullet) {
            const randomDur = 3000 + Math.random() * 3000;
            const delay = Math.random() * randomDur;
            setTimeout(function () {
              const sprite = bullet.get('sprite');
              if (sprite) sprite.set('visible', true);
              bullet.animate({
                key: 'locationX',
                from: 0,
                to: 1,
                duration: randomDur,
                easing: am5.ease.linear,
                loops: Infinity,
              });
            }, delay);
          });
        }
      });
    });

    // Add Globe / Map projection toggle
    const switchCont = chart.children.push(
      am5.Container.new(root, {
        layout: root.horizontalLayout,
        x: 20,
        y: 20,
      })
    );

    switchCont.children.push(
      am5.Label.new(root, {
        centerY: am5.p50,
        text: 'Globe',
        fill: ink,
        fontSize: 13,
        fontWeight: '500',
        fontFamily: 'var(--font-sans), Onest, sans-serif',
      })
    );

    const switchButton = switchCont.children.push(
      am5.Button.new(root, {
        themeTags: ['switch'],
        centerY: am5.p50,
        icon: am5.Circle.new(root, {
          themeTags: ['icon'],
        }),
      })
    );

    const easing = am5.ease.inOut(am5.ease.cubic);
    const duration = 1500;
    const fadeDuration = 300;

    // Physics-based Momentum Spin & Auto-Return to India Animation
    let isDragging = false;
    let isTouchDrag = false;
    let isTouchScroll = false;
    let startPointerX = 0;
    let startPointerY = 0;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let lastPointerTime = 0;
    let velocityX = 0;
    let velocityY = 0;
    let inertiaRafId: number | null = null;
    let returnTimeoutId: NodeJS.Timeout | null = null;
    let ambientAnimation: ReturnType<typeof chart.animate> | null = null;
    let returnAnimX: ReturnType<typeof chart.animate> | null = null;
    let returnAnimY: ReturnType<typeof chart.animate> | null = null;

    function stopAllAnimations() {
      if (ambientAnimation) {
        ambientAnimation.stop();
        ambientAnimation = null;
      }
      if (returnAnimX) {
        returnAnimX.stop();
        returnAnimX = null;
      }
      if (returnAnimY) {
        returnAnimY.stop();
        returnAnimY = null;
      }
      if (inertiaRafId) {
        cancelAnimationFrame(inertiaRafId);
        inertiaRafId = null;
      }
      if (returnTimeoutId) {
        clearTimeout(returnTimeoutId);
        returnTimeoutId = null;
      }
    }

    function startAmbientRotation() {
      if (switchButton.get('active')) return;
      stopAllAnimations();
      const currentRotX = chart.get('rotationX', INDIA_ROT_X);
      ambientAnimation = chart.animate({
        key: 'rotationX',
        from: currentRotX,
        to: currentRotX + 360,
        duration: 90000,
        loops: Infinity,
        easing: am5.ease.linear,
      });
    }

    function scheduleReturnToIndia(delayMs = 2000) {
      if (switchButton.get('active')) return;
      if (returnTimeoutId) clearTimeout(returnTimeoutId);

      returnTimeoutId = setTimeout(() => {
        if (isDragging || switchButton.get('active')) return;

        const currentRotX = chart.get('rotationX', INDIA_ROT_X);
        const currentRotY = chart.get('rotationY', INDIA_ROT_Y);

        const diff = (((currentRotX - INDIA_ROT_X) % 360) + 540) % 360 - 180;
        const targetRotX = currentRotX - diff;
        const targetRotY = INDIA_ROT_Y;

        stopAllAnimations();

        const returnDuration = 2000;
        const returnEasing = am5.ease.inOut(am5.ease.cubic);

        returnAnimY = chart.animate({
          key: 'rotationY',
          to: targetRotY,
          duration: returnDuration,
          easing: returnEasing,
        });

        returnAnimX = chart.animate({
          key: 'rotationX',
          to: targetRotX,
          duration: returnDuration,
          easing: returnEasing,
        });

        returnTimeoutId = setTimeout(() => {
          startAmbientRotation();
        }, returnDuration + 80);
      }, delayMs);
    }

    function startInertia() {
      stopAllAnimations();

      if (Math.abs(velocityX) < 0.08 && Math.abs(velocityY) * 0.6 < 0.08) {
        scheduleReturnToIndia(1800);
        return;
      }

      const friction = 0.962;

      function step() {
        if (isDragging || switchButton.get('active')) return;

        velocityX *= friction;
        velocityY *= friction;

        let currentRotX = chart.get('rotationX', INDIA_ROT_X) + velocityX;
        let currentRotY = chart.get('rotationY', INDIA_ROT_Y) + velocityY;

        currentRotY = Math.max(-60, Math.min(60, currentRotY));

        chart.set('rotationX', currentRotX);
        chart.set('rotationY', currentRotY);

        if (Math.abs(velocityX) > 0.04 || Math.abs(velocityY) > 0.04) {
          inertiaRafId = requestAnimationFrame(step);
        } else {
          inertiaRafId = null;
          scheduleReturnToIndia(1800);
        }
      }

      inertiaRafId = requestAnimationFrame(step);
    }

    const onPointerDown = (e: PointerEvent) => {
      if (switchButton.get('active')) return;
      isDragging = true;
      isTouchDrag = false;
      isTouchScroll = false;
      startPointerX = e.clientX;
      startPointerY = e.clientY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      lastPointerTime = performance.now();
      velocityX = 0;
      velocityY = 0;

      if (e.pointerType !== 'touch') {
        stopAllAnimations();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || switchButton.get('active')) return;
      if (isTouchScroll) return;

      const now = performance.now();
      const dt = now - lastPointerTime;
      const totalDx = e.clientX - startPointerX;
      const totalDy = e.clientY - startPointerY;

      if (e.pointerType === 'touch' && !isTouchDrag) {
        if (Math.abs(totalDy) > Math.abs(totalDx) && Math.abs(totalDy) > 6) {
          isTouchScroll = true;
          isDragging = false;
          return;
        }
        if (Math.abs(totalDx) > Math.abs(totalDy) && Math.abs(totalDx) > 6) {
          isTouchDrag = true;
          stopAllAnimations();
        } else {
          return;
        }
      }

      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;

      if (dt > 0 && dt < 120) {
        const speedFactor = 0.35;
        const vx = (dx / dt) * 16 * speedFactor;
        const vy = -(dy / dt) * 16 * speedFactor;
        velocityX = velocityX * 0.35 + vx * 0.65;
        velocityY = e.pointerType === 'touch' ? 0 : velocityY * 0.35 + vy * 0.65;
      }

      if (e.pointerType === 'touch') {
        const currentRotX = chart.get('rotationX', INDIA_ROT_X) + dx * 0.45;
        chart.set('rotationX', currentRotX);
      }

      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      lastPointerTime = now;
    };

    const onPointerUp = () => {
      if (!isDragging && !isTouchDrag) {
        isDragging = false;
        isTouchScroll = false;
        return;
      }
      isDragging = false;
      const timeSinceMove = performance.now() - lastPointerTime;
      if (timeSinceMove > 90) {
        velocityX = 0;
        velocityY = 0;
      }
      if (!isTouchScroll) {
        startInertia();
      } else {
        scheduleReturnToIndia(1800);
      }
      isTouchDrag = false;
      isTouchScroll = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    function zoomToGlobe() {
      stopAllAnimations();
      const isMobileView = typeof window !== 'undefined' && window.innerWidth <= 768;
      chart.set('projection', am5map.geoOrthographic());
      chart.set('panX', 'rotateX');
      chart.set('panY', isMobileView ? 'none' : 'rotateY');
      chart.animate({
        key: 'rotationX',
        to: INDIA_ROT_X,
        duration: duration,
        easing: easing,
      });
      chart.animate({
        key: 'rotationY',
        to: INDIA_ROT_Y,
        duration: duration,
        easing: easing,
      });
      bgSeries.mapPolygons.template.set('fillOpacity', 0.55);
      chart.set('minZoomLevel', 0.5);
      chart.animate({
        key: 'zoomLevel',
        to: isMobileView ? 0.82 : 0.9,
        duration: duration,
        easing: easing,
      });
      setTimeout(() => {
        startAmbientRotation();
      }, duration + 100);
    }

    function zoomToMap() {
      stopAllAnimations();
      const isMobileView = typeof window !== 'undefined' && window.innerWidth <= 768;
      chart.set('projection', am5map.geoMercator());
      chart.set('panX', 'translateX');
      chart.set('panY', 'translateY');
      chart.animate({
        key: 'rotationX',
        to: 0,
        duration: duration,
        easing: easing,
      });
      chart.animate({
        key: 'rotationY',
        to: 0,
        duration: duration,
        easing: easing,
      });
      bgSeries.mapPolygons.template.set('fillOpacity', 0);
      chart.set('minZoomLevel', 1);
      chart.animate({
        key: 'zoomLevel',
        to: isMobileView ? 1.2 : 1.7,
        duration: duration,
        easing: easing,
      });
    }

    switchButton.on('active', function () {
      chart.goHome(duration);
      setTimeout(function () {
        chart.seriesContainer.animate({
          key: 'opacity',
          to: 0,
          duration: fadeDuration,
        });
      }, duration - fadeDuration);
      setTimeout(function () {
        if (switchButton.get('active')) {
          zoomToMap();
        } else {
          zoomToGlobe();
        }
        chart.seriesContainer.animate({
          key: 'opacity',
          to: 1,
          duration: fadeDuration,
        });
      }, duration);
    });

    switchCont.children.push(
      am5.Label.new(root, {
        centerY: am5.p50,
        text: 'Map',
        fill: ink,
        fontSize: 13,
        fontWeight: '500',
        fontFamily: 'var(--font-sans), Onest, sans-serif',
      })
    );

    // Initial appearance animation
    chart.appear(1000, 100);
    startAmbientRotation();

    return () => {
      stopAllAnimations();
      container.removeEventListener('wheel', handleTrackpadPinch);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      root.dispose();
    };
  }, []);

  return (
    <div className="globe-wrapper">
      <div className="globe-aura" />
      <div ref={chartRef} id="chartdiv" />

      
    </div>
  );
}
