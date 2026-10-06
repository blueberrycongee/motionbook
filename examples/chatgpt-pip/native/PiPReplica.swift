// Clean-room AppKit/Core Animation replica target. Not compiled on the Linux host.
// Native constants were recovered from sky.node 26.930.51102; this is original source.
// Deliberately contains no proprietary native binary, app account, or real desktop capture.
// The small window-to-companion control is independently authored vector artwork.
// Public fog and local-image contrast input remain documented approximations. Recovered motion
// and envelope equations are implemented below; native rendering/runtime parity is unverified.
import AppKit
import QuartzCore
import WebKit
import CoreVideo

struct PiPSpec {
    static let icon: CGFloat = 50
    static let check: CGFloat = 18
    static let badge: CGFloat = 17.5
    static let badgeOffset: CGFloat = 18
    static let corner: CGFloat = 8
    static func maxSize(_ value: CGFloat) -> CGFloat { value.isFinite ? min(400, max(1, value)) : 200 }
    static func fit(_ source: CGSize, maximum: CGFloat) -> CGSize {
        let m = maxSize(maximum)
        guard source.width.isFinite && source.height.isFinite && source.width > 0 && source.height > 0 else { return CGSize(width: m, height: m) }
        let ratio = m / max(source.width, source.height)
        return CGSize(width: max(1,source.width * ratio), height: max(1,source.height * ratio))
    }
}

func basic(_ layer: CALayer, _ key: String, from: Any, to: Any, duration: CFTimeInterval) {
    let a = CABasicAnimation(keyPath: key); a.fromValue = from; a.toValue = to; a.duration = duration
    // Source completion initial fade uses the exported EaseOut timing function.
    a.timingFunction = CAMediaTimingFunction(name: .easeOut)
    CATransaction.begin(); CATransaction.setDisableActions(true); layer.setValue(to, forKeyPath: key); CATransaction.commit()
    layer.add(a, forKey: key)
}
func spring(_ layer: CALayer, _ key: String, from: Any, to: Any, stiffness: CGFloat = 170, damping: CGFloat = 18) {
    let a = CASpringAnimation(keyPath: key); a.fromValue = from; a.toValue = to
    a.mass = 1; a.stiffness = stiffness; a.damping = damping; a.initialVelocity = 0; a.duration = a.settlingDuration
    CATransaction.begin(); CATransaction.setDisableActions(true); layer.setValue(to, forKeyPath: key); CATransaction.commit()
    layer.add(a, forKey: key)
}
func cgImage(_ image: NSImage) -> CGImage? {
    var rect = CGRect(origin: .zero, size: image.size)
    return image.cgImage(forProposedRect: &rect, context: nil, hints: nil)
}

final class CompletionEffect {
    let root = CALayer(), scrim = CALayer(), icon = CALayer(), dim = CALayer(), check = CALayer(), badge = CALayer()
    private var generation = 0
    private let suppliedIcon: NSImage?
    private enum Stage { case hidden, icon, full, mini }
    private var stage: Stage = .hidden
    init(applicationIcon: NSImage?) {
        suppliedIcon = applicationIcon
        root.addSublayer(scrim); root.addSublayer(icon); root.addSublayer(dim); root.addSublayer(badge); root.addSublayer(check)
        scrim.backgroundColor = NSColor.black.cgColor
        scrim.compositingFilter = "sourceAtop"
        if let image = applicationIcon, let cg = cgImage(image) {
            icon.contents = cg; icon.contentsGravity = .resizeAspect
            dim.backgroundColor = NSColor.black.cgColor
            let mask = CALayer(); mask.contents = cg; mask.contentsGravity = .resizeAspect; dim.mask = mask
        }
        badge.backgroundColor = NSColor(calibratedRed: 0, green: 230/255, blue: 45/255, alpha: 1).cgColor
        badge.cornerRadius = 8.75; badge.shadowColor = NSColor.black.cgColor; badge.shadowOpacity = 0.8; badge.shadowRadius = 4
        setCheckColor(.white)
        stop()
    }
    private func setCheckColor(_ color: NSColor) {
        let config = NSImage.SymbolConfiguration(pointSize: 18, weight: .bold)
        guard let symbol = NSImage(systemSymbolName: "checkmark", accessibilityDescription: "Completed")?.withSymbolConfiguration(config) else { return }
        let result = NSImage(size: CGSize(width: 18, height: 18)); result.lockFocus()
        symbol.draw(in: CGRect(x: 0, y: 0, width: 18, height: 18))
        NSGraphicsContext.saveGraphicsState(); NSGraphicsContext.current?.compositingOperation = .sourceAtop
        color.setFill(); NSBezierPath(rect: CGRect(x: 0, y: 0, width: 18, height: 18)).fill(); NSGraphicsContext.restoreGraphicsState()
        result.unlockFocus(); check.contents = cgImage(result)
    }
    func layout(_ size: CGSize) {
        root.frame = CGRect(origin: .zero, size: size); scrim.frame = root.bounds
        let center = CGPoint(x: size.width/2, y: size.height/2)
        icon.bounds = CGRect(x: 0, y: 0, width: 50, height: 50); icon.position = center
        dim.frame = icon.frame; dim.mask?.frame = dim.bounds
        let markCenter = stage == .mini ? CGPoint(x: center.x + 18, y: center.y - 18) : center
        check.bounds = CGRect(x: 0, y: 0, width: 18, height: 18); check.position = markCenter
        badge.bounds = CGRect(x: 0, y: 0, width: 17.5, height: 17.5); badge.position = markCenter
    }
    func show(in size: CGSize) {
        stop(); layout(size); let current = generation
        CATransaction.begin(); CATransaction.setDisableActions(true)
        root.isHidden = false; stage = .icon; setCheckColor(.white)
        basic(scrim, "opacity", from: 0, to: 0.17, duration: 0.35)
        if suppliedIcon != nil {
            basic(icon, "opacity", from: 0, to: 1, duration: 0.35)
            DispatchQueue.main.asyncAfter(deadline: .now() + 1) { [weak self] in
                guard let self = self, self.generation == current else { return }
                self.fullCheck()
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in
                    guard let self = self, self.generation == current else { return }; self.miniCheck()
                }
            }
        } else { fullCheck() }
        CATransaction.commit()
    }
    private func fullCheck() {
        stage = .full
        basic(dim, "opacity", from: 0, to: 0.65, duration: 0.25)
        basic(check, "opacity", from: 0, to: 1, duration: 0.2)
        spring(check, "transform.scale", from: 0.01, to: 1)
    }
    private func miniCheck() {
        stage = .mini
        basic(dim, "opacity", from: 0.65, to: 0, duration: 0.25)
        let center = CGPoint(x: root.bounds.midX, y: root.bounds.midY)
        let destination = CGPoint(x: center.x + 18, y: center.y - 18)
        setCheckColor(NSColor(calibratedWhite: 0, alpha: 0.5))
        basic(badge, "opacity", from: 0, to: 1, duration: 0.2)
        spring(badge, "position", from: NSValue(point: center), to: NSValue(point: destination))
        spring(badge, "transform.scale", from: 0.01, to: 1)
        spring(check, "position", from: NSValue(point: center), to: NSValue(point: destination))
        spring(check, "transform.scale", from: 1, to: 0.5)
    }
    func stop() {
        generation += 1; stage = .hidden
        CATransaction.begin(); CATransaction.setDisableActions(true)
        for layer in [root,scrim,icon,dim,check,badge] { layer.removeAllAnimations() }
        root.isHidden = true; scrim.opacity = 0; icon.opacity = 0; dim.opacity = 0; check.opacity = 0; badge.opacity = 0
        check.transform = CATransform3DIdentity; badge.transform = CATransform3DIdentity
        CATransaction.commit()
    }
}

// Source alignment values, recovered from updateRestOffsetsForAlignment (0x22c68).
// AppKit is y-up: 0 TL, 1 TR, 2 BR, 3 BL, 4 TC, 5 BC.
enum PiPAlignment: Int, CaseIterable {
    case topLeft, topRight, bottomRight, bottomLeft, topCenter, bottomCenter
    var title: String { ["Top left", "Top right", "Bottom right", "Bottom left", "Top center", "Bottom center"][rawValue] }
    var unit: CGPoint {
        switch self {
        case .topLeft: return CGPoint(x: 0, y: 1)
        case .topRight: return CGPoint(x: 1, y: 1)
        case .bottomRight: return CGPoint(x: 1, y: 0)
        case .bottomLeft: return CGPoint(x: 0, y: 0)
        case .topCenter: return CGPoint(x: 0.5, y: 1)
        case .bottomCenter: return CGPoint(x: 0.5, y: 0)
        }
    }
    func point(in rect: CGRect) -> CGPoint {
        CGPoint(x: rect.minX + unit.x * rect.width, y: rect.minY + unit.y * rect.height)
    }
    func restOffset(size: CGSize, index: Int) -> CGPoint {
        let i = CGFloat(index), u = unit
        return CGPoint(x: -u.x * size.width + (1 - 2 * u.x) * 28 * i,
                       y: -u.y * size.height + (u.y == 0 ? 1 : -1) * 22 * i)
    }
}
enum PiPPlacement: String, CaseIterable { case home, pinned, pet }
enum PiPProducer: Equatable { case browserImage, simulatedComputer }
private func plus(_ a: CGPoint, _ b: CGPoint) -> CGPoint { CGPoint(x: a.x + b.x, y: a.y + b.y) }
private func minus(_ a: CGPoint, _ b: CGPoint) -> CGPoint { CGPoint(x: a.x - b.x, y: a.y - b.y) }
private func times(_ p: CGPoint, _ n: CGFloat) -> CGPoint { CGPoint(x: p.x * n, y: p.y * n) }
private func length(_ p: CGPoint) -> CGFloat { hypot(p.x, p.y) }
private func withoutActions(_ body: () -> Void) {
    CATransaction.begin(); CATransaction.setDisableActions(true); body(); CATransaction.commit()
}

// This host only registers the replica's own local windows, never another application's window.
final class PiPHost {
    let id: String, placement: PiPPlacement
    weak var owner: NSWindow?
    let contentRect: () -> CGRect
    let explicitAlignments: [PiPAlignment]?
    var interactionPassthroughContentRect: (() -> CGRect)?
    var passthroughScreenFrame: CGRect? {
        guard let owner = owner, let rect = interactionPassthroughContentRect?() else { return nil }; return owner.convertToScreen(rect)
    }
    init(id: String, placement: PiPPlacement, owner: NSWindow, explicitAlignments: [PiPAlignment]? = nil, contentRect: @escaping () -> CGRect) {
        self.id = id; self.placement = placement; self.owner = owner; self.contentRect = contentRect
        self.explicitAlignments = explicitAlignments
    }
    var anchors: [(PiPAlignment, CGPoint)] {
        if let explicit = explicitAlignments { return explicit.map { ($0, $0.point(in: anchorFrame)) } }
        // Source fallback is FOUR corners, inset 24pt. Six supported values are not six defaults.
        let frame = anchorFrame.insetBy(dx: 24, dy: 24)
        return [PiPAlignment.bottomLeft, .bottomRight, .topLeft, .topRight].map { ($0, $0.point(in: frame)) }
    }
    func point(for alignment: PiPAlignment) -> CGPoint? { anchors.first { $0.0 == alignment }?.1 }
    var anchorFrame: CGRect { owner?.convertToScreen(contentRect()) ?? .zero }
    var available: Bool { guard let owner = owner else { return false }; return owner.isVisible && !owner.isMiniaturized }
}

final class PiPItem {
    let id: String, threadID: String, producer: PiPProducer
    let root = CALayer(), card = CALayer(), imageLayer = CALayer(), hoverOverlay = CALayer()
    let completion: CompletionEffect
    var sourceSize: CGSize, size: CGSize = .zero
    var origin: CGPoint = .zero, target: CGPoint = .zero, velocity: CGPoint = .zero, restOffset: CGPoint = .zero
    var initialized = false, completed = false, invalidationDeferred = false
    var generation = 0
    private(set) var localImageLuminance: CGFloat?
    var stiffness: CGFloat = 260, damping: CGFloat = 32
    var onFocus: (() -> Void)?
    init(id: String, threadID: String, producer: PiPProducer, image: NSImage, applicationIcon: NSImage?) {
        self.id = id; self.threadID = threadID; self.producer = producer; sourceSize = image.size
        completion = CompletionEffect(applicationIcon: applicationIcon)
        root.addSublayer(card); card.addSublayer(imageLayer); imageLayer.addSublayer(completion.root)
        hoverOverlay.backgroundColor = NSColor.black.withAlphaComponent(0.06).cgColor
        hoverOverlay.compositingFilter = "sourceAtop"; hoverOverlay.isHidden = true; imageLayer.addSublayer(hoverOverlay)
        card.shadowColor = NSColor.black.cgColor; card.shadowOpacity = 0.16; card.shadowRadius = 10
        card.shadowOffset = CGSize(width: 0, height: -6)
        imageLayer.cornerRadius = 8; imageLayer.masksToBounds = true; imageLayer.contentsGravity = .resizeAspectFill
        imageLayer.contents = cgImage(image); localImageLuminance = Self.luminance(image)
    }
    func update(_ image: NSImage) {
        generation += 1; completed = false; invalidationDeferred = false; completion.stop()
        sourceSize = image.size; imageLayer.contents = cgImage(image); localImageLuminance = Self.luminance(image)
    }
    private static func luminance(_ image: NSImage) -> CGFloat? {
        // Fallback input is the supplied fixture image, never CGWindowList desktop capture.
        // The original samples pixels below controls; this full-image sample does not claim that backing parity.
        guard let source = cgImage(image) else { return nil }
        var pixels = [UInt8](repeating: 0, count: 24 * 12 * 4)
        return pixels.withUnsafeMutableBytes { bytes -> CGFloat? in
            guard let context = CGContext(data: bytes.baseAddress, width: 24, height: 12, bitsPerComponent: 8,
                                          bytesPerRow: 24 * 4, space: CGColorSpaceCreateDeviceRGB(),
                                          bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { return nil }
            context.draw(source, in: CGRect(x: 0, y: 0, width: 24, height: 12))
            let data = bytes.bindMemory(to: UInt8.self)
            var total: CGFloat = 0, weights: CGFloat = 0
            for i in stride(from: 0, to: data.count, by: 4) {
                let alpha = CGFloat(data[i + 3]) / 255; guard alpha > 0.05 else { continue }
                let r = min(1, CGFloat(data[i]) / 255 / alpha), g = min(1, CGFloat(data[i + 1]) / 255 / alpha), b = min(1, CGFloat(data[i + 2]) / 255 / alpha)
                total += (0.2126 * r + 0.7152 * g + 0.0722 * b) * alpha; weights += alpha
            }
            return weights > 0 ? total / weights : nil
        }
    }
    func layout(maximum: CGFloat, alignment: PiPAlignment) {
        size = PiPSpec.fit(sourceSize, maximum: maximum)
        root.bounds = CGRect(origin: .zero, size: size)
        card.anchorPoint = alignment.unit
        card.bounds = root.bounds
        card.position = CGPoint(x: size.width * alignment.unit.x, y: size.height * alignment.unit.y)
        imageLayer.frame = root.bounds; hoverOverlay.frame = imageLayer.bounds; completion.layout(size)
    }
    func appear() {
        guard !NSWorkspace.shared.accessibilityDisplayShouldReduceMotion else { return }
        spring(card, "transform.scale", from: 0.72, to: 1, stiffness: 185, damping: 18)
        basic(card, "opacity", from: 0, to: 1, duration: 0.2)
        // Blur endpoints 18→0 are established, but Apple's private CAFilter is intentionally absent.
    }
    func stop() { generation += 1; completion.stop(); root.removeAllAnimations(); card.removeAllAnimations() }
    @discardableResult func tick(_ dt: CGFloat) -> Bool {
        // sky.node0x26090: one semi-implicit Euler step, not substeps or an analytic spring.
        let preStepError = minus(target, origin)
        let acceleration = minus(times(preStepError, stiffness), times(velocity, damping))
        velocity = plus(velocity, times(acceleration, dt))
        origin = plus(origin, times(velocity, dt))
        // The native helper AND its settled caller retain residual origin/velocity. Never snap here.
        return length(preStepError) <= 0.5 && length(velocity) <= 2
    }

}

final class PiPWindow: NSPanel {
    override var canBecomeKey: Bool { false }
    override var canBecomeMain: Bool { false }
    init() {
        super.init(contentRect: CGRect(x: 0, y: 0, width: 1, height: 1), styleMask: [.nonactivatingPanel], backing: .buffered, defer: false)
        backgroundColor = .clear; isOpaque = false; hasShadow = false; level = .normal
        acceptsMouseMovedEvents = true; collectionBehavior = [.transient, .fullScreenAuxiliary]
        hidesOnDeactivate = false; isMovableByWindowBackground = false; isReleasedWhenClosed = false
    }
}

// An ordinary NSView supplies AppKit tooltips; pointer handling stays with the stack controller
// so dragging >=4pt out of a pressed control can transition into a stack drag.
final class PiPControlButton: NSView {
    let controlID: String
    weak var controller: PiPStackController?
    let glyph = CALayer(), text = CATextLayer()
    private var cachedGlyphSize: CGSize = .zero
    init(controlID: String) {
        self.controlID = controlID; super.init(frame: .zero); wantsLayer = true
        layer?.addSublayer(glyph); layer?.addSublayer(text)
        text.font = NSFont.systemFont(ofSize: 12, weight: .semibold); text.fontSize = 12; text.alignmentMode = .center
    }
    required init?(coder: NSCoder) { fatalError("Not supported") }
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }
    override func mouseDown(with event: NSEvent) { controller?.beginPointer(at: NSEvent.mouseLocation, timestamp: event.timestamp) }
    override func mouseDragged(with event: NSEvent) { controller?.dragPointer(to: NSEvent.mouseLocation, timestamp: event.timestamp) }
    override func mouseUp(with event: NSEvent) { controller?.endPointer(at: NSEvent.mouseLocation) }
    func configure(title: String?, image: NSImage?, color: NSColor, animateColor: Bool, hover: Bool) {
        withoutActions {
            let scale = window?.backingScaleFactor ?? 2
            text.contentsScale = scale; glyph.contentsScale = scale
            text.string = title ?? ""; text.frame = CGRect(x: 0, y: 4, width: bounds.width, height: 15)
            text.isHidden = title == nil; glyph.isHidden = title != nil
            text.foregroundColor = color.cgColor
            layer?.opacity = hover ? 1 : 0.7
            if let image = image {
                let dimension: CGFloat = controlID == "pet" ? 16 : 14
                glyph.frame = CGRect(x: (bounds.width - dimension) / 2, y: (bounds.height - dimension) / 2 - (controlID == "pet" ? 1 : 0), width: dimension, height: dimension)
                if glyph.mask == nil || cachedGlyphSize != glyph.bounds.size {
                    let mask = CALayer(); mask.frame = glyph.bounds; mask.contents = cgImage(image); mask.contentsGravity = .resizeAspect
                    glyph.mask = mask; cachedGlyphSize = glyph.bounds.size
                }
                if animateColor {
                    let from = glyph.presentation()?.backgroundColor ?? glyph.backgroundColor ?? color.cgColor
                    let a = CABasicAnimation(keyPath: "backgroundColor"); a.fromValue = from; a.toValue = color.cgColor
                    a.duration = 0.16; a.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut); glyph.add(a, forKey: "contrast")
                }
                glyph.backgroundColor = color.cgColor
            }
        }
    }
}

final class PiPStackContentView: NSView {
    weak var controller: PiPStackController? {
        didSet { primary.controller = controller; pet.controller = controller }
    }
    let controls: Bool
    let group = NSView(), primary = PiPControlButton(controlID: "primary"), pet = PiPControlButton(controlID: "pet")
    let fog = CALayer(), resizeMark = CAShapeLayer()
    private var tracking: NSTrackingArea?, reveal: Float = 0
    private var wasBlack = false
    private let xmarkImage = NSImage(systemSymbolName: "xmark", accessibilityDescription: "Return Picture-in-Picture to Codex")?.withSymbolConfiguration(.init(pointSize: 14, weight: .heavy))
    var petImage = NSImage(systemSymbolName: "pawprint", accessibilityDescription: "Send Picture-in-Picture to Pet")
    var controlsHoverFrame: CGRect = .zero
    private var primaryFrame: CGRect = .zero, petFrame: CGRect = .zero
    // Geometry is source-evidenced; using tinted public layers instead of CAFilter/CABackdropLayer is not pixel parity.
    init(controls: Bool) {
        self.controls = controls; super.init(frame: .zero); wantsLayer = true
        guard controls else { return }
        group.wantsLayer = true; group.layer?.opacity = 0; group.layer?.zPosition = 100000; addSubview(group)
        fog.zPosition = -1; group.layer?.addSublayer(fog); group.addSubview(primary); group.addSubview(pet)
        fog.backgroundColor = NSColor(calibratedWhite: 0.8, alpha: 0.15).cgColor
        fog.cornerRadius = 21; fog.shadowOpacity = 0.12; fog.shadowRadius = 6; fog.shadowColor = NSColor.black.cgColor
        resizeMark.fillColor = NSColor.clear.cgColor; resizeMark.strokeColor = NSColor.white.withAlphaComponent(0.85).cgColor
        resizeMark.lineWidth = 1.5; layer?.addSublayer(resizeMark); resizeMark.isHidden = true
    }
    required init?(coder: NSCoder) { fatalError("Not supported") }
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }
    override func updateTrackingAreas() {
        super.updateTrackingAreas(); if let tracking = tracking { removeTrackingArea(tracking) }
        let t = NSTrackingArea(rect: bounds, options: [.activeAlways, .mouseEnteredAndExited, .mouseMoved, .cursorUpdate, .inVisibleRect, .enabledDuringMouseDrag], owner: self, userInfo: nil)
        addTrackingArea(t); tracking = t
    }
    override func hitTest(_ point: NSPoint) -> NSView? {
        guard controls, controller?.interactive(at: point) == true else { return nil }
        if controller?.resizeRect?.contains(point) == true { return self }
        if let id = control(at: point) { return id == "primary" ? primary : pet }
        return self
    }
    override func cursorUpdate(with event: NSEvent) { controller?.refreshHover() }
    override func mouseMoved(with event: NSEvent) { controller?.refreshHover() }
    override func mouseEntered(with event: NSEvent) { controller?.refreshHover() }
    override func mouseExited(with event: NSEvent) { controller?.refreshHover() }
    override func mouseDown(with event: NSEvent) { controller?.beginPointer(at: NSEvent.mouseLocation, timestamp: event.timestamp) }
    override func mouseDragged(with event: NSEvent) { controller?.dragPointer(to: NSEvent.mouseLocation, timestamp: event.timestamp) }
    override func mouseUp(with event: NSEvent) { controller?.endPointer(at: NSEvent.mouseLocation) }
    override func resetCursorRects() {
        super.resetCursorRects()
        for rect in controller?.resizeRects ?? [] { addCursorRect(rect, cursor: .resizeUpDown) }
    }
    // Native layout eligibility, stored reveal target, and visual opacity are three separate states.
    var controlsVisible: Bool { !group.isHidden && !primaryFrame.isEmpty }
    var revealTarget: Float { reveal }
    var controlHitsEnabled: Bool { controlsVisible && revealTarget > 0.001 }
    func control(at point: CGPoint) -> String? {
        guard controlHitsEnabled else { return nil }
        if primaryFrame.contains(point) { return "primary" }
        if !pet.isHidden && petFrame.contains(point) { return "pet" }; return nil
    }
    func clearControls() {
        reveal = 0; group.layer?.removeAnimation(forKey: "controlsReveal"); group.layer?.opacity = 0; group.isHidden = true
        controlsHoverFrame = .zero; primaryFrame = .zero; petFrame = .zero; fog.frame = .zero
        primary.toolTip = nil; pet.toolTip = nil; resizeMark.isHidden = true
    }
    func revealControls(_ show: Bool) {
        let target: Float = show ? 1 : 0
        guard target != reveal else { return }; reveal = target
        guard let layer = group.layer else { return }
        let a = CABasicAnimation(keyPath: "opacity"); a.fromValue = layer.presentation()?.opacity ?? layer.opacity
        a.toValue = target; a.duration = NSWorkspace.shared.accessibilityDisplayShouldReduceMotion ? 0 : 0.12
        a.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
        withoutActions { layer.opacity = target }; layer.add(a, forKey: "controlsReveal")
    }
    func layoutControls(card: CGRect, placement: PiPPlacement, inside: Bool, black: Bool, hoveredControl: String?) {
        guard controls else { return }; group.isHidden = false
        let hideWidth = ceil(("Hide" as NSString).size(withAttributes: [.font: NSFont.systemFont(ofSize: 12, weight: .semibold)]).width) + 16
        let firstWidth: CGFloat = placement == .home ? max(22, hideWidth) : 22
        let x = inside ? card.minX + 6 : card.minX - (placement == .home ? 8 : 4)
        let y = inside ? card.maxY - 28 : card.maxY + 2
        primaryFrame = CGRect(x: x, y: y, width: firstWidth, height: 22)
        petFrame = CGRect(x: primaryFrame.maxX + 1, y: y, width: 22, height: 22)
        let row = placement == .pet ? primaryFrame : primaryFrame.union(petFrame)
        let fogFrame = row.insetBy(dx: -18, dy: -10)
        // Backdrop source adds22 beyond this fog, with blur6 and blurred mask14. Neither private filter is invoked.
        group.frame = fogFrame.insetBy(dx: -22, dy: -22)
        fog.frame = fogFrame.offsetBy(dx: -group.frame.minX, dy: -group.frame.minY)
        primary.frame = primaryFrame.offsetBy(dx: -group.frame.minX, dy: -group.frame.minY)
        pet.frame = petFrame.offsetBy(dx: -group.frame.minX, dy: -group.frame.minY); pet.isHidden = placement == .pet
        controlsHoverFrame = fogFrame
        let changed = black != wasBlack; wasBlack = black
        let color: NSColor = black ? .black : .white
        // Prefer the separately attributed tiny reference glyph; SF Symbol remains the missing-asset fallback.
        primary.toolTip = reveal > 0.001 ? (placement == .home ? "Hide Picture-in-Picture" : "Return Picture-in-Picture to Codex") : nil
        pet.toolTip = reveal > 0.001 ? "Send Picture-in-Picture to Pet" : nil
        primary.configure(title: placement == .home ? "Hide" : nil, image: xmarkImage, color: color, animateColor: changed, hover: hoveredControl == "primary")
        pet.configure(title: nil, image: petImage, color: color, animateColor: changed, hover: hoveredControl == "pet")
        if let handle = controller?.resizeRect {
            let path = CGMutablePath(); path.move(to: CGPoint(x: handle.minX + 4, y: handle.minY + 4)); path.addLine(to: CGPoint(x: handle.maxX - 4, y: handle.maxY - 4))
            resizeMark.path = path; resizeMark.isHidden = false
        } else { resizeMark.isHidden = true }
    }
    func showHideMenu() {
        let menu = NSMenu()
        let thread = NSMenuItem(title: "Hide for this chat", action: #selector(hideThread), keyEquivalent: ""); thread.target = self; menu.addItem(thread)
        let all = NSMenuItem(title: "Hide for all active chats", action: #selector(hideAll), keyEquivalent: ""); all.target = self; menu.addItem(all)
        menu.popUp(positioning: nil, at: CGPoint(x: primaryFrame.minX, y: primaryFrame.minY), in: self)
    }
    @objc private func hideThread() { controller?.hideCurrentThread() }
    @objc private func hideAll() { controller?.hideAllActiveThreads() }
}

// The CoreVideo callback thread never touches AppKit. A relay coalesces pending main-queue
// frames and stays alive through shutdown even if an already-enqueued frame is delivered later.
private final class PiPFrameRelay {
    private let lock = NSLock()
    private let deliver: (CFTimeInterval) -> Void
    private var active = false, pending = false
    private var generation: UInt64 = 0
    init(deliver: @escaping (CFTimeInterval) -> Void) { self.deliver = deliver }
    func activate() { lock.lock(); generation &+= 1; active = true; pending = false; lock.unlock() }
    func deactivate() { lock.lock(); generation &+= 1; active = false; pending = false; lock.unlock() }
    func requestFrame(at timestamp: CFTimeInterval) {
        lock.lock()
        guard active && !pending else { lock.unlock(); return }
        pending = true; let capturedGeneration = generation; lock.unlock()
        DispatchQueue.main.async { [self] in
            lock.lock()
            guard active && generation == capturedGeneration else { lock.unlock(); return }
            pending = false; lock.unlock()
            deliver(timestamp)
        }
    }
}
private let pipDisplayLinkCallback: CVDisplayLinkOutputCallback = { _, _, outputTime, _, _, context in
    guard let context = context else { return kCVReturnSuccess }
    let relay = Unmanaged<PiPFrameRelay>.fromOpaque(context).takeUnretainedValue()
    let timestamp = Double(outputTime.pointee.hostTime) / CVGetHostClockFrequency()
    relay.requestFrame(at: timestamp)
    return kCVReturnSuccess
}

final class PiPStackController {
    let contentPanel = PiPWindow(), controlPanel = PiPWindow()
    let contentView = PiPStackContentView(controls: false), controlView = PiPStackContentView(controls: true)
    private(set) var items: [String: PiPItem] = [:], order: [String] = []
    private var exiting: [PiPItem] = []
    var hosts: [PiPHost] = []
    private(set) var alignment: PiPAlignment = .bottomRight, currentThread = "fixture-thread"
    private(set) var maximum: CGFloat = 200
    private var placements: [String: PiPPlacement] = [:], suppressed: Set<String> = []
    private var host: PiPHost?, lastHostFrame: CGRect = .zero, anchor: CGPoint = .zero
    private var observations: [NSObjectProtocol] = [], fallbackTimer: Timer?, lastTick: CFTimeInterval = 0
    private var displayLink: CVDisplayLink?
    private var frameDriverUnavailable = false, shuttingDown = false
    private let allowTimerFallback = ProcessInfo.processInfo.environment["PIP_ALLOW_TIMER_FALLBACK"] == "1"
    private var frameRelay: PiPFrameRelay!
    private var localMouseMonitor: Any?, globalMouseMonitor: Any?
    private(set) var schedulerDescription = "CoreVideo display link"
    private var hoveredID: String?, pointer: PointerInteraction?, resize: ResizeInteraction?
    private var pressedControl: (id: String, start: CGPoint, timestamp: TimeInterval)?
    private var blackControls = false, darkConfirmationCount = 0
    private var lastContrastSample: CFTimeInterval = 0, lastContrastChange: CFTimeInterval = 0
    private var envelope: CGRect = .zero, hiddenForDOMVideo = false
    private var expandedEnvelopeSize: CGSize?, frozenResizeEnvelope: CGRect?
    private var motionNeedsStep = false, allMotionSettled = true, programmaticMoveActive = false
    private var expandedMotionEnvelope: Bool {
        pointer != nil || resize != nil || programmaticMoveActive || !allMotionSettled
    }
    var onStatus: ((String) -> Void)?, onChange: (() -> Void)?
    var placement: PiPPlacement { placements[currentThread] ?? .pinned }
    var visible: [PiPItem] {
        Array(order.compactMap { items[$0] }.filter { ($0.threadID == currentThread || placement == .pet) && !suppressed.contains($0.threadID) }.prefix(5))
    }
    // All four14pt corner handles participate. Highest-z HANDLE candidate wins.
    // Source0x1e014 does not first reject a rear handle covered by a front card body.
    var resizeRects: [CGRect] {
        guard pointer == nil else { return [] }
        return visible.flatMap { item -> [CGRect] in
            let r = localFrame(item)
            return [CGRect(x: r.maxX - 14, y: r.minY, width: 14, height: 14),
                    CGRect(x: r.minX, y: r.minY, width: 14, height: 14),
                    CGRect(x: r.minX, y: r.maxY - 14, width: 14, height: 14),
                    CGRect(x: r.maxX - 14, y: r.maxY - 14, width: 14, height: 14)]
        }
    }
    private func resizeHit(at point: CGPoint) -> (item: PiPItem, frame: CGRect, fixed: PiPAlignment)? {
        guard pointer == nil else { return nil }
        let alignments: [PiPAlignment] = [.topLeft, .topRight, .bottomRight, .bottomLeft]
        let rects = resizeRects
        for (index, item) in visible.enumerated() {
            for corner in 0..<4 where rects[index * 4 + corner].contains(point) {
                return (item, rects[index * 4 + corner], alignments[corner])
            }
        }
        return nil
    }
    var resizeRect: CGRect? { resizeHit(at: minus(NSEvent.mouseLocation, envelope.origin))?.frame }
    private struct PointerInteraction {
        let itemID: String, start: CGPoint, grabOffset: CGPoint
        var previous: CGPoint, timestamp: TimeInterval, velocity: CGPoint = .zero, moved = false
    }
    private struct ResizeInteraction { let start: CGPoint, maximum: CGFloat, alignment: PiPAlignment, itemID: String, fixedScreenPoint: CGPoint }
    init() {
        frameRelay = PiPFrameRelay { [weak self] timestamp in
            guard let self = self else { return }
            // Relay clears pending before this running check, matching the native main-queue delivery order.
            guard self.fallbackTimer != nil || self.displayLink.map({ CVDisplayLinkIsRunning($0) }) == true else { return }
            self.tick(at: timestamp)
        }
        contentView.controller = self; controlView.controller = self
        contentPanel.contentView = contentView; controlPanel.contentView = controlView
        contentPanel.ignoresMouseEvents = true; controlPanel.ignoresMouseEvents = true
        let center = NotificationCenter.default
        for name in [NSWindow.didMoveNotification, NSWindow.didResizeNotification, NSWindow.didChangeScreenNotification,
                     NSWindow.didMiniaturizeNotification, NSWindow.didDeminiaturizeNotification, NSWindow.willCloseNotification,
                     NSWindow.didBecomeKeyNotification, NSWindow.didResignKeyNotification, NSWindow.didBecomeMainNotification, NSWindow.didResignMainNotification] {
            observations.append(center.addObserver(forName: name, object: nil, queue: .main) { [weak self] note in
                guard let self = self, let window = note.object as? NSWindow, window === self.host?.owner else { return }
                if note.name == NSWindow.willCloseNotification { self.cancelInteraction(); self.hidePanels(); return }
                if note.name == NSWindow.didChangeScreenNotification { self.frameDriverUnavailable = false }
                self.ownerChanged()
            })
        }
        for name in [NSApplication.didBecomeActiveNotification, NSApplication.didResignActiveNotification] {
            observations.append(center.addObserver(forName: name, object: nil, queue: .main) { [weak self] _ in self?.ownerChanged() })
        }
        localMouseMonitor = NSEvent.addLocalMonitorForEvents(matching: .mouseMoved) { [weak self] event in
            self?.refreshHover(); return event
        }
        globalMouseMonitor = NSEvent.addGlobalMonitorForEvents(matching: .mouseMoved) { [weak self] _ in
            self?.refreshHover()
        }
    }
    deinit {
        stopFrameDriver()
        if let monitor = localMouseMonitor { NSEvent.removeMonitor(monitor) }
        if let monitor = globalMouseMonitor { NSEvent.removeMonitor(monitor) }
        for observation in observations { NotificationCenter.default.removeObserver(observation) }
    }
    func shutdown() {
        shuttingDown = true; stopFrameDriver(); displayLink = nil
        if let monitor = localMouseMonitor { NSEvent.removeMonitor(monitor); localMouseMonitor = nil }
        if let monitor = globalMouseMonitor { NSEvent.removeMonitor(monitor); globalMouseMonitor = nil }
        invalidateAll(); detach(); contentPanel.close(); controlPanel.close()
    }
    // Visibility side of the production DOM-video contract only. No DOM/XPC video producer is fabricated.
    func setHiddenForDOMVideo(_ hidden: Bool) {
        hiddenForDOMVideo = hidden
        if hidden { cancelInteraction(); hidePanels(); detach() }
        else { chooseHost(); reconcile(programmatic: false) }
    }
    func setThread(_ thread: String) {
        cancelInteraction(); for item in exiting { item.root.removeFromSuperlayer() }; exiting.removeAll()
        currentThread = thread; chooseHost(); reconcile(programmatic: true); onChange?()
    }
    func setAlignment(_ value: PiPAlignment) {
        guard let point = host?.point(for: value) else {
            onStatus?("This host has four fallback corner anchors. Center anchors are explicitly registered only for the sidebar and Pet fixtures."); onChange?(); return
        }
        cancelInteraction(); alignment = value; anchor = point
        reconcile(programmatic: true); onStatus?("Anchor: \(alignment.title). Native alignment \(alignment.rawValue)."); onChange?()
    }
    func setPlacement(_ value: PiPPlacement) {
        cancelInteraction(); placements[currentThread] = value
        if value == .pinned { alignment = .bottomRight }
        if let destination = hosts.first(where: { $0.placement == value }) { destination.owner?.orderFront(nil) }
        chooseHost(); reconcile(programmatic: true)
        onStatus?("Placement: \(value.rawValue). Attached to the replica's own \(host?.id ?? "unavailable") host."); onChange?()
    }
    func setMaximum(_ value: CGFloat) {
        let scale = envelopeBackingScale
        let clipped = min(400, max(100, PiPSpec.maxSize(value))), snapped = (clipped * scale).rounded() / scale
        guard abs(snapped - maximum) >= 0.5 else { return }
        maximum = snapped; reconcile(programmatic: false); onChange?()
    }
    func upsert(id: String, thread: String, producer: PiPProducer, image: NSImage, icon: NSImage?, focus: @escaping () -> Void) {
        let isNew = items[id] == nil
        let item: PiPItem
        if let old = items[id] { item = old; item.update(image) }
        else { item = PiPItem(id: id, threadID: thread, producer: producer, image: image, applicationIcon: icon); items[id] = item; order.insert(id, at: 0) }
        item.onFocus = focus
        if host == nil { chooseHost() }; reconcile(programmatic: false)
        if isNew && visible.contains(where: { $0 === item }) { item.appear() }
        onChange?()
    }
    func remove(_ id: String, animated: Bool = true) {
        guard let item = items.removeValue(forKey: id) else { return }
        order.removeAll { $0 == id }; item.stop()
        if pointer?.itemID == id || resize?.itemID == id { cancelInteraction() }
        if animated && item.root.superlayer != nil && !NSWorkspace.shared.accessibilityDisplayShouldReduceMotion {
            exiting.append(item)
            spring(item.card, "transform.scale", from: 1, to: 0.72, stiffness: 185, damping: 18)
            let fade = CABasicAnimation(keyPath: "opacity"); fade.fromValue = item.card.presentation()?.opacity ?? 1
            fade.toValue = 0; fade.duration = 0.22; fade.timingFunction = CAMediaTimingFunction(name: .easeIn)
            withoutActions { item.card.opacity = 0 }; item.card.add(fade, forKey: "exitOpacity")
            // No private exit blur filter. Keep exit geometry alive for the actual native spring settling time.
            let duration = CASpringAnimation(keyPath: "transform.scale"); duration.mass = 1; duration.stiffness = 185; duration.damping = 18
            DispatchQueue.main.asyncAfter(deadline: .now() + max(duration.settlingDuration, 0.24)) { [weak self, weak item] in
                guard let self = self, let item = item else { return }
                item.root.removeFromSuperlayer(); self.exiting.removeAll { $0 === item }; self.render()
            }
        } else { item.root.removeFromSuperlayer() }
        reconcile(programmatic: false); onChange?()
    }
    func endBrowserTurn(thread: String) {
        for item in Array(items.values) where item.threadID == thread && item.producer == .browserImage { remove(item.id) }
        onStatus?("Browser turn completed: browser image presentations removed immediately; no 30-second retention.")
    }
    func completeComputer(thread: String) {
        for item in items.values where item.threadID == thread && item.producer == .simulatedComputer && !item.completed {
            item.completed = true; item.completion.show(in: item.size); item.generation += 1
            let generation = item.generation, id = item.id
            DispatchQueue.main.asyncAfter(deadline: .now() + 30) { [weak self, weak item] in
                guard let self = self, let item = item, self.items[id] === item, item.generation == generation, item.completed else { return }
                self.remove(id); self.onStatus?("Simulated computer presentation expired after 30 seconds.")
            }
        }
        onStatus?("Simulated computer completion: icon at 0s, check at 1s, mini badge at 2.5s; expires at 30s. Browser cards are unchanged.")
    }
    func invalidateComputer(thread: String) {
        for item in Array(items.values) where item.threadID == thread && item.producer == .simulatedComputer {
            if item.completed { item.invalidationDeferred = true }
            else { remove(item.id) }
        }
        onStatus?("Computer fixture invalidated. Completed items defer removal until expiry; no XPC connection or remote reply is simulated.")
    }
    func invalidateAll() {
        cancelInteraction()
        for item in Array(items.values) { remove(item.id, animated: false) }
        for item in exiting { item.stop(); item.root.removeFromSuperlayer() }; exiting.removeAll()
        motionNeedsStep = false; allMotionSettled = true; programmaticMoveActive = false
        expandedEnvelopeSize = nil; frozenResizeEnvelope = nil; hidePanels()
    }
    func hideCurrentThread() { suppressed.insert(currentThread); reconcile(programmatic: false); onStatus?("Hidden for \(currentThread)."); onChange?() }
    func hideAllActiveThreads() {
        suppressed.formUnion(items.values.map { $0.threadID }); reconcile(programmatic: false)
        onStatus?("Hidden for all currently active fixture chats. A future new chat is not automatically suppressed."); onChange?()
    }
    func showCurrentThread() { suppressed.remove(currentThread); reconcile(programmatic: true); onStatus?("Showing \(currentThread)."); onChange?() }
    private func cancelInteraction() { pointer = nil; resize = nil; frozenResizeEnvelope = nil; pressedControl = nil; hoveredID = nil; controlView.revealControls(false) }
    private func detach() {
        contentPanel.parent?.removeChildWindow(contentPanel); controlPanel.parent?.removeChildWindow(controlPanel)
    }
    private func chooseHost() {
        guard let selected = hosts.first(where: { $0.placement == placement }) else { hidePanels(); return }
        guard !hiddenForDOMVideo, let owner = selected.owner, owner !== contentPanel, owner !== controlPanel else { detach(); hidePanels(); return }
        if selected !== host || contentPanel.parent !== owner || controlPanel.parent !== owner {
            let contentFrame = contentPanel.frame, controlFrame = controlPanel.frame
            detach(); host = selected
            owner.addChildWindow(contentPanel, ordered: .above); owner.addChildWindow(controlPanel, ordered: .above)
            contentPanel.level = owner.level; controlPanel.level = owner.level
            contentPanel.setFrame(contentFrame, display: false); controlPanel.setFrame(controlFrame, display: false)
        }
        lastHostFrame = selected.anchorFrame
        if selected.point(for: alignment) == nil { alignment = selected.anchors.first?.0 ?? .bottomRight }
        anchor = selected.point(for: alignment) ?? lastHostFrame.origin
    }
    private func ownerChanged() {
        guard let host = host else { return }
        guard host.available else { cancelInteraction(); hidePanels(); return }
        let frame = host.anchorFrame
        // Pure owner movement follows immediately, retaining local spring offsets. Resize re-targets the anchor.
        if frame.size == lastHostFrame.size && pointer == nil && resize == nil {
            let delta = minus(frame.origin, lastHostFrame.origin)
            for item in visible + exiting { item.origin = plus(item.origin, delta); item.target = plus(item.target, delta) }
        }
        lastHostFrame = frame
        if pointer == nil { anchor = host.point(for: alignment) ?? frame.origin; reconcile(programmatic: false) }
        else { render() }
    }
    private func reconcile(programmatic: Bool) {
        let active = visible, ids = Set(active.map { $0.id })
        var effectiveAnchor = anchor
        if let resize = resize, let index = active.firstIndex(where: { $0.id == resize.itemID }) {
            let size = PiPSpec.fit(active[index].sourceSize, maximum: maximum)
            let fixedLocal = CGPoint(x: size.width * resize.alignment.unit.x, y: size.height * resize.alignment.unit.y)
            let leadOrigin = minus(resize.fixedScreenPoint, fixedLocal)
            effectiveAnchor = minus(leadOrigin, alignment.restOffset(size: size, index: index))
        }
        for item in items.values where !ids.contains(item.id) { item.root.removeFromSuperlayer() }
        var changedTarget = false
        withoutActions {
            for (i, item) in active.enumerated() {
                item.layout(maximum: maximum, alignment: alignment)
                item.restOffset = alignment.restOffset(size: item.size, index: i)
                let nextTarget = plus(effectiveAnchor, item.restOffset)
                if item.initialized && nextTarget != item.target { changedTarget = true }
                item.target = nextTarget
                if !item.initialized { item.origin = item.target; item.initialized = true }
                let leadID = pointer?.itemID ?? resize?.itemID ?? active.first?.id
                let leadIndex = active.firstIndex(where: { $0.id == leadID }) ?? 0
                var distance = CGFloat(abs(i - leadIndex))
                if programmatic { distance *= 1 + 0.45 * distance }
                if i == leadIndex { item.stiffness = pointer == nil ? 320 : 900; item.damping = pointer == nil ? 42 : 55 }
                else {
                    item.stiffness = (pointer == nil ? 150 : 260) / (1 + 0.18 * distance)
                    item.damping = (pointer == nil ? 30 : 32) / (1 + 0.08 * distance)
                }
                item.root.zPosition = CGFloat(active.count - i)
                if item.root.superlayer !== contentView.layer { contentView.layer?.addSublayer(item.root) }
                if NSWorkspace.shared.accessibilityDisplayShouldReduceMotion { item.origin = item.target; item.velocity = .zero }
            }
        }
        for item in exiting {
            let nextTarget = plus(effectiveAnchor, item.restOffset)
            if nextTarget != item.target { changedTarget = true }
            item.target = nextTarget
        }
        if NSWorkspace.shared.accessibilityDisplayShouldReduceMotion {
            allMotionSettled = true; motionNeedsStep = false; programmaticMoveActive = false
        } else if changedTarget || pointer != nil || resize != nil || (programmatic && !active.isEmpty) {
            startMotion(programmatic: programmatic)
        }
        render()
    }
    private func startMotion(programmatic: Bool) {
        // Both native start paths seed the timestamp with current time; there is no synthetic1/60 first frame.
        if !motionNeedsStep { lastTick = CACurrentMediaTime() }
        motionNeedsStep = true; allMotionSettled = false
        programmaticMoveActive = programmaticMoveActive || programmatic
        startFrameDriver()
    }
    private func startFrameDriver() {
        guard !shuttingDown && !frameDriverUnavailable else { return }
        if fallbackTimer != nil { return }
        if let link = displayLink, CVDisplayLinkIsRunning(link) { return }
        if displayLink == nil {
            var created: CVDisplayLink?
            let result = CVDisplayLinkCreateWithActiveCGDisplays(&created)
            guard result == kCVReturnSuccess, let link = created else {
                startTimerFallback(reason: "CVDisplayLink creation failed: \(result)"); return
            }
            let callbackResult = CVDisplayLinkSetOutputCallback(link, pipDisplayLinkCallback, Unmanaged.passUnretained(frameRelay!).toOpaque())
            guard callbackResult == kCVReturnSuccess else {
                startTimerFallback(reason: "CVDisplayLink callback setup failed: \(callbackResult)"); return
            }
            displayLink = link
        }
        guard let link = displayLink else { return }
        frameRelay.activate(); lastTick = CACurrentMediaTime()
        let result = CVDisplayLinkStart(link)
        guard result == kCVReturnSuccess else {
            frameRelay.deactivate()
            if CVDisplayLinkIsRunning(link) { CVDisplayLinkStop(link) }
            displayLink = nil; startTimerFallback(reason: "CVDisplayLink start failed: \(result)"); return
        }
        schedulerDescription = "CoreVideo display link"; onChange?()
    }
    private func startTimerFallback(reason: String) {
        guard allowTimerFallback else {
            frameDriverUnavailable = true; schedulerDescription = "Display link unavailable"
            NSLog("%@", reason)
            onStatus?("\(reason). No Timer substitute is enabled. PIP_ALLOW_TIMER_FALLBACK=1 opts into a visibly labeled degraded scheduler.")
            onChange?(); return
        }
        // Explicit opt-in degraded mode only after the official create/setup/start call fails.
        frameRelay.activate(); lastTick = CACurrentMediaTime()
        let timer = Timer(timeInterval: 1.0 / 60.0, repeats: true) { [weak self] _ in
            self?.frameRelay.requestFrame(at: CACurrentMediaTime())
        }
        fallbackTimer = timer; RunLoop.main.add(timer, forMode: .common)
        schedulerDescription = "Timer fallback: \(reason)"
        onStatus?("Native display link unavailable. Using a 60Hz Timer fallback. \(reason)"); onChange?()
    }
    private func stopFrameDriver() {
        frameRelay.deactivate()
        fallbackTimer?.invalidate(); fallbackTimer = nil
        if let link = displayLink, CVDisplayLinkIsRunning(link) { CVDisplayLinkStop(link) }
    }
    private func updateFrameDriverNeed() {
        let hasContributors = !visible.isEmpty || !exiting.isEmpty
        let visibleHost = !shuttingDown && host?.available == true && !hiddenForDOMVideo
        let contrastActive = resize == nil && controlView.controlHitsEnabled
        if hasContributors && visibleHost && (motionNeedsStep || contrastActive) { startFrameDriver() }
        else { stopFrameDriver() }
    }
    private func tick(at timestamp: CFTimeInterval) {
        guard !visible.isEmpty || !exiting.isEmpty else {
            motionNeedsStep = false; allMotionSettled = true; programmaticMoveActive = false
            stopFrameDriver()
            return // A later start must reseed its timestamp rather than inherit an idle gap.
        }
        if motionNeedsStep {
            let dt = CGFloat(min(1.0 / 30.0, max(1.0 / 120.0, timestamp - lastTick))); lastTick = timestamp
            var settled = true
            for item in visible + exiting { let itemSettled = item.tick(dt); settled = settled && itemSettled }
            allMotionSettled = settled
            if settled && pointer == nil && resize == nil {
                programmaticMoveActive = false; motionNeedsStep = false
                // Source reapplies the stationary envelope; it does not zero residual velocity or offset.
            }
        }
        render(); updateFrameDriverNeed()
    }
    private func hidePanels() {
        controlView.clearControls(); controlPanel.ignoresMouseEvents = true
        contentPanel.orderOut(nil); controlPanel.orderOut(nil); stopFrameDriver()
    }
    private var envelopeBackingScale: CGFloat { contentPanel.backingScaleFactor }
    private func snapEnvelopeScalar(_ value: CGFloat) -> CGFloat {
        let scale = envelopeBackingScale; return (value * scale).rounded() / scale
    }
    private func clampEnvelopeToVisibleScreen(_ frame: CGRect) -> CGRect {
        // Native screen preference: content panel → owner → main screen. Translate only, never shrink.
        guard let screen = contentPanel.screen ?? host?.owner?.screen ?? NSScreen.main else { return frame }
        let visible = screen.visibleFrame
        let x = max(visible.minX, min(frame.minX, visible.maxX - frame.width))
        let y = max(visible.minY, min(frame.minY, visible.maxY - frame.height))
        return CGRect(x: snapEnvelopeScalar(x), y: snapEnvelopeScalar(y), width: frame.width, height: frame.height)
    }
    private func resizeEnvelope(for content: CGRect, interaction: ResizeInteraction) -> CGRect {
        let overscan: CGFloat = 246
        let spread = CGFloat(max(visible.count + exiting.count - 1, 0))
        // Native0x23208/0x2326c takes the componentwise maxima BEFORE positioning the reserve.
        let width = max(content.width + 2 * overscan, 400 + 28 * spread + 2 * overscan)
        let height = max(content.height + 2 * overscan, 400 + 22 * spread + 2 * overscan)
        let fixed = interaction.fixedScreenPoint
        let effectiveAlignment = alignment.unit.x == 0.5 ? alignment : interaction.alignment
        let fx = effectiveAlignment.unit.x, bottom = effectiveAlignment.unit.y == 0
        let reserved = CGRect(x: fixed.x - width * fx + overscan * (2 * fx - 1),
                              y: bottom ? fixed.y - overscan : fixed.y - height + overscan,
                              width: width, height: height)
        let union = reserved.union(content.insetBy(dx: -overscan, dy: -overscan))
        let snapped = CGRect(x: snapEnvelopeScalar(union.minX), y: snapEnvelopeScalar(union.minY),
                             width: snapEnvelopeScalar(max(1, union.width)), height: snapEnvelopeScalar(max(1, union.height)))
        let clamped = clampEnvelopeToVisibleScreen(snapped)
        return CGRect(x: floor(clamped.minX), y: floor(clamped.minY), width: clamped.width, height: clamped.height)
    }
    private func render() {
        let rendered = visible + exiting
        guard let host = host, host.available, !hiddenForDOMVideo, !rendered.isEmpty else { hidePanels(); return }
        // C contains current contributing item frames, including exits. Targets are not unioned into C.
        var content = CGRect.null
        for item in rendered { content = content.union(CGRect(origin: item.origin, size: item.size)) }
        let requested: CGRect
        let freezeNewResizeFrame = resize != nil && frozenResizeEnvelope == nil
        if let resize = resize {
            requested = frozenResizeEnvelope ?? resizeEnvelope(for: content, interaction: resize)
        } else if expandedMotionEnvelope {
            let minimum = CGSize(width: content.width + 492, height: content.height + 492)
            let size = CGSize(width: max(minimum.width, expandedEnvelopeSize?.width ?? 0),
                              height: max(minimum.height, expandedEnvelopeSize?.height ?? 0))
            expandedEnvelopeSize = size
            requested = clampEnvelopeToVisibleScreen(CGRect(x: content.midX - size.width / 2,
                                                           y: content.midY - size.height / 2,
                                                           width: size.width, height: size.height))
        } else {
            expandedEnvelopeSize = nil
            requested = content.insetBy(dx: -66, dy: -66)
        }
        withoutActions {
            let appliedRequest = CGRect(origin: requested.origin, size: CGSize(width: max(1, requested.width), height: max(1, requested.height)))
            contentPanel.setFrame(appliedRequest, display: false); controlPanel.setFrame(appliedRequest, display: false)
            envelope = contentPanel.frame
            // Source freezes the actual AppKit-applied frame, not merely the requested geometry.
            if freezeNewResizeFrame { frozenResizeEnvelope = envelope }
            contentView.frame = CGRect(origin: .zero, size: envelope.size); controlView.frame = contentView.frame
            for item in rendered { item.root.anchorPoint = .zero; item.root.position = minus(item.origin, envelope.origin) }
        }
        if !contentPanel.isVisible { contentPanel.orderFront(nil) }
        if !controlPanel.isVisible { controlPanel.orderFront(nil) }
        controlPanel.order(.above, relativeTo: contentPanel.windowNumber)
        layoutControlsForCurrentFrames(); refreshHover(); updateFrameDriverNeed()
    }
    private func layoutControlsForCurrentFrames() {
        guard let lead = visible.max(by: { localFrame($0).maxY < localFrame($1).maxY }) else { controlView.clearControls(); return }
        let point = minus(NSEvent.mouseLocation, envelope.origin)
        withoutActions {
            controlView.layoutControls(card: localFrame(lead), placement: placement, inside: visible.count == 1,
                                       black: blackControls, hoveredControl: resize == nil ? controlView.control(at: point) : nil)
        }
    }
    private func localFrame(_ item: PiPItem) -> CGRect { CGRect(origin: minus(item.origin, envelope.origin), size: item.size) }
    private func item(at point: CGPoint) -> PiPItem? { visible.first { localFrame($0).contains(point) } }
    private func passthrough(at point: CGPoint) -> Bool {
        host?.passthroughScreenFrame?.contains(plus(point, envelope.origin)) ?? false
    }
    func interactive(at point: CGPoint) -> Bool {
        guard !passthrough(at: point) else { return false }
        if resizeRect?.contains(point) == true { return true }
        return item(at: point) != nil || controlView.control(at: point) != nil
    }
    private func updateContrast(from item: PiPItem, enabled: Bool) {
        guard enabled, resize == nil, !motionNeedsStep else { return }
        let now = CACurrentMediaTime()
        guard now - lastContrastSample >= 0.05, let luminance = item.localImageLuminance else { return }
        lastContrastSample = now
        if blackControls && luminance < 0.56 && now - lastContrastChange < 0.24 { return }
        if !blackControls && luminance > 0.74 {
            blackControls = true; lastContrastChange = now; darkConfirmationCount = 0
        } else if blackControls && luminance < 0.56 && now - lastContrastChange >= 0.24 {
            darkConfirmationCount += 1
            if darkConfirmationCount >= 3 { blackControls = false; lastContrastChange = now; darkConfirmationCount = 0 }
        } else { darkConfirmationCount = 0 }
    }
    func refreshHover() {
        guard controlPanel.isVisible, resize == nil else { return }
        let point = minus(NSEvent.mouseLocation, envelope.origin)
        let hovered = passthrough(at: point) ? nil : item(at: point)
        hoveredID = hovered?.id
        guard let lead = visible.max(by: { localFrame($0).maxY < localFrame($1).maxY }) else {
            hoveredID = nil; controlView.clearControls(); controlPanel.ignoresMouseEvents = true
            return
        }
        // Fog geometry can reveal a layout-eligible group even when its current alpha/target is zero.
        let inControlRegion = controlView.controlsVisible && controlView.controlsHoverFrame.contains(point)
        let show = !passthrough(at: point) && (hovered != nil || inControlRegion)
        updateContrast(from: lead, enabled: show && controlView.controlHitsEnabled)
        withoutActions {
            for item in visible { item.hoverOverlay.isHidden = item.id != hoveredID }
            controlView.layoutControls(card: localFrame(lead), placement: placement, inside: visible.count == 1,
                                       black: blackControls, hoveredControl: controlView.control(at: point))
        }
        controlView.revealControls(show)
        if !show { controlView.primary.toolTip = nil; controlView.pet.toolTip = nil }
        // Source local/global mouseMoved monitors observe position but never consume keyboard/input events.
        controlPanel.ignoresMouseEvents = pointer == nil && resize == nil && pressedControl == nil && !interactive(at: point)
        controlPanel.invalidateCursorRects(for: controlView); updateFrameDriverNeed()
    }
    func beginPointer(at screen: CGPoint, timestamp: TimeInterval) {
        let local = minus(screen, envelope.origin)
        guard !passthrough(at: local) else { return }
        if let hit = resizeHit(at: local) {
            let fixedAlignment = alignment.unit.x == 0.5 ? alignment : hit.fixed
            let point = fixedAlignment.point(in: CGRect(origin: hit.item.origin, size: hit.item.size))
            let scale = envelopeBackingScale
            let snapped = CGPoint(x: (point.x * scale).rounded() / scale, y: (point.y * scale).rounded() / scale)
            hoveredID = hit.item.id; frozenResizeEnvelope = nil
            // Preserve the original host alignment/anchor. The resize interaction has its own fixed corner.
            resize = ResizeInteraction(start: screen, maximum: maximum, alignment: fixedAlignment, itemID: hit.item.id, fixedScreenPoint: snapped)
            controlView.primary.layer?.opacity = 0.7; controlView.pet.layer?.opacity = 0.7
            render() // Resizing explicitly expands and freezes its initial envelope before movement.
            return
        }
        if let control = controlView.control(at: local) { pressedControl = (control, screen, timestamp); return }
        guard let selected = item(at: local) else { return }
        // Source 0x1edec..0x1ee18 grabs the rendered origin, including an interrupted spring's offset.
        pointer = PointerInteraction(itemID: selected.id, start: screen, grabOffset: minus(screen, selected.origin), previous: screen, timestamp: timestamp)
        updateTargetAnchorFromDragInteraction()
        reconcile(programmatic: false)
    }
    func dragPointer(to screen: CGPoint, timestamp: TimeInterval) {
        if let pressed = pressedControl {
            guard length(minus(screen, pressed.start)) >= 4, let lead = visible.first else { return }
            pressedControl = nil
            pointer = PointerInteraction(itemID: lead.id, start: pressed.start, grabOffset: minus(pressed.start, lead.origin), previous: pressed.start, timestamp: pressed.timestamp)
        }
        if let resize = resize {
            let sign: CGFloat = resize.alignment.unit.y == 0 ? 1 : -1
            setMaximum(resize.maximum + sign * (screen.y - resize.start.y)); return
        }
        guard var interaction = pointer else { return }
        let dt = CGFloat(max(1.0 / 240.0, timestamp - interaction.timestamp))
        interaction.velocity = plus(times(interaction.velocity, 0.72), times(minus(screen, interaction.previous), 0.28 / dt))
        interaction.previous = screen; interaction.timestamp = timestamp
        interaction.moved = interaction.moved || length(minus(screen, interaction.start)) >= 4
        pointer = interaction
        // Source 0x23570..0x235fc has no 4pt target dead zone; moved only classifies the interaction.
        updateTargetAnchorFromDragInteraction(); reconcile(programmatic: false)
    }
    private func updateTargetAnchorFromDragInteraction() {
        guard let interaction = pointer, let lead = items[interaction.itemID] else { return }
        anchor = minus(minus(interaction.previous, interaction.grabOffset), lead.restOffset)
    }
    private func currentStackAnchorOrDefault() -> CGPoint {
        guard let host = host else { return .zero }
        // Source 0x24630..0x246b4 averages initialized active contributors, not target positions.
        // Removed exits leave presentationOrder at 0x1ce3c and are not part of this sample.
        let contributors = visible.filter { $0.initialized }
        // Source 0x246c4..0x246d0 falls back to the host's rest anchor, never the drag target.
        guard !contributors.isEmpty else { return host.point(for: alignment) ?? host.anchorFrame.origin }
        let total = contributors.reduce(CGPoint.zero) { plus($0, minus($1.origin, $1.restOffset)) }
        return times(total, 1 / CGFloat(contributors.count))
    }
    func endPointer(at screen: CGPoint) {
        if let pressed = pressedControl {
            pressedControl = nil
            let local = minus(screen, envelope.origin)
            guard !passthrough(at: local), controlView.control(at: local) == pressed.id else { refreshHover(); return }
            if pressed.id == "pet" { setPlacement(.pet) }
            else if placement == .home { controlView.showHideMenu() }
            else { setPlacement(.home) }
            return
        }
        if resize != nil {
            resize = nil; frozenResizeEnvelope = nil
            if alignment.unit.x == 0.5 { render() } else { reconcile(programmatic: false) }
            onStatus?("Maximum display dimension: \(Int(maximum))pt, aspect and original host alignment preserved."); return
        }
        guard let interaction = pointer else { return }
        if !interaction.moved && visible.first?.id == interaction.itemID { items[interaction.itemID]?.onFocus?() }
        // Source 0x1eff0..0x1f070 selects from current geometry BEFORE promotion/reindexing.
        let destination = snap(from: currentStackAnchorOrDefault(), velocity: interaction.velocity,
                               allowOtherHosts: interaction.moved || length(interaction.velocity) >= 120)
        pointer = nil
        if let index = order.firstIndex(of: interaction.itemID) { order.remove(at: index); order.insert(interaction.itemID, at: 0) }
        if let destination = destination { moveStackToAnchor(destination, leadItemID: interaction.itemID, velocity: interaction.velocity) }
        else { reconcile(programmatic: false) }
        onChange?()
    }
    private func snap(from currentAnchor: CGPoint, velocity: CGPoint, allowOtherHosts: Bool) -> (host: PiPHost, alignment: PiPAlignment, point: CGPoint)? {
        guard let current = host else { return nil }
        let scaled = times(velocity, 0.55), speed = length(scaled)
        let time = min(0.45, max(0.18, 0.18 + speed / 5000)), projected = plus(currentAnchor, times(scaled, time))
        var best: (host: PiPHost, alignment: PiPAlignment, point: CGPoint, score: CGFloat)?
        for candidate in hosts where candidate.available {
            let crossesHost = candidate !== current
            if crossesHost && (!allowOtherHosts || !candidate.anchorFrame.insetBy(dx: -120, dy: -120).contains(projected)) { continue }
            for (align, point) in candidate.anchors {
                let direction = minus(point, currentAnchor)
                let directionLength = length(direction), rawSpeed = length(velocity)
                let dot: CGFloat = directionLength > 0 && rawSpeed > 0 ? (direction.x * velocity.x + direction.y * velocity.y) / (directionLength * rawSpeed) : 0
                let score = length(minus(point, projected)) + (crossesHost ? 180 : 0) - 0.12 * speed * max(0, dot)
                if best == nil || score < best!.score { best = (candidate, align, point, score) }
            }
        }
        guard let best = best else { return nil }
        return (best.host, best.alignment, best.point)
    }
    private func moveStackToAnchor(_ destination: (host: PiPHost, alignment: PiPAlignment, point: CGPoint), leadItemID: String, velocity: CGPoint) {
        placements[currentThread] = destination.host.placement; alignment = destination.alignment; chooseHost(); anchor = destination.point
        // Source 0x20820..0x20894 reindexes and configures dragging=false, programmaticMove=false.
        programmaticMoveActive = false
        reconcile(programmatic: false)
        if !NSWorkspace.shared.accessibilityDisplayShouldReduceMotion {
            let active = visible
            let leadIndex = active.firstIndex(where: { $0.id == leadItemID })
            // Source 0x208c0..0x208dc thresholds raw filtered speed, then overwrites with 25%.
            let releaseVelocity = length(velocity) >= 120 ? times(velocity, 0.25) : CGPoint.zero
            for (index, item) in active.enumerated() {
                // Source 0x209a0..0x209d0 attenuates by POST-promotion distance to the lead.
                let distance = leadIndex.map { CGFloat(abs(index - $0)) } ?? 0
                item.velocity = times(releaseVelocity, 1 / (1 + 0.45 * distance))
            }
            startMotion(programmatic: false); render()
        }
        onStatus?("Snapped to \(alignment.title) on \(destination.host.id); native velocity projection and cross-host scoring.")
    }
}

final class ReplicaApp: NSObject, NSApplicationDelegate, WKNavigationDelegate {
    var fixtureWindow: NSWindow!, controlsWindow: NSWindow!, petWindow: NSWindow!
    var web: WKWebView!, fixtureRoot: NSView!, sidebar: NSView!
    var status: NSTextField!, summary: NSTextField!, slider: NSSlider!, omitIcon: NSButton!, placementPicker: NSPopUpButton!, anchorPicker: NSPopUpButton!, threadPicker: NSPopUpButton!
    let stack = PiPStackController(), sourceRoot: URL
    private var browserEpoch: [String: Int] = [:], requestEpoch: [String: Int] = [:], allEpoch = 0, serial = 1
    private var fixtureReady = false
    init(root: URL) { sourceRoot = root; super.init() }
    func applicationDidFinishLaunching(_ notification: Notification) {
        let menu = NSMenu(), appItem = NSMenuItem(), appMenu = NSMenu()
        appMenu.addItem(withTitle: "Quit PiP Replica", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appItem.submenu = appMenu; menu.addItem(appItem); NSApp.mainMenu = menu
        buildFixture(); buildPet(); buildControls()
        if let reference = NSImage(contentsOf: sourceRoot.appendingPathComponent("public/assets/window-to-companion@3x.png")) {
            stack.controlView.petImage = reference
        }
        stack.hosts = [
            PiPHost(id: "fixture-floating", placement: .pinned, owner: fixtureWindow) { [weak self] in
                guard let self = self else { return .zero }; return self.web.frame
            },
            PiPHost(id: "fixture-sidebar", placement: .home, owner: fixtureWindow, explicitAlignments: PiPAlignment.allCases) { [weak self] in
                guard let self = self else { return .zero }; return self.sidebar.frame.insetBy(dx: 20, dy: 60)
            },
            PiPHost(id: "fixture-pet", placement: .pet, owner: petWindow, explicitAlignments: [.bottomCenter, .topCenter]) { CGRect(x: 20, y: 82, width: 280, height: 180) }
        ]
        stack.onStatus = { [weak self] value in self?.status.stringValue = value }
        stack.onChange = { [weak self] in self?.refreshControls() }
        stack.setThread("fixture-thread"); refreshControls()
        controlsWindow.makeKeyAndOrderFront(nil); NSApp.activate(ignoringOtherApps: true)
        let file = sourceRoot.appendingPathComponent("public/fixture.html")
        web.loadFileURL(file, allowingReadAccessTo: sourceRoot.appendingPathComponent("public"))
    }
    private func buildFixture() {
        fixtureWindow = NSWindow(contentRect: CGRect(x: 120, y: 180, width: 1200, height: 600), styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
        fixtureWindow.title = "PiP"; fixtureWindow.isReleasedWhenClosed = false
        fixtureWindow.minSize = CGSize(width: 760, height: 440)
        fixtureRoot = NSView(frame: CGRect(x: 0, y: 0, width: 1200, height: 600)); fixtureWindow.contentView = fixtureRoot
        sidebar = NSView(frame: CGRect(x: 0, y: 0, width: 240, height: 600)); sidebar.wantsLayer = true
        sidebar.layer?.backgroundColor = NSColor.controlBackgroundColor.cgColor; sidebar.autoresizingMask = [.height]; fixtureRoot.addSubview(sidebar)
        let label = NSTextField(wrappingLabelWithString: "")
        label.frame = CGRect(x: 18, y: 370, width: 204, height: 200); label.autoresizingMask = [.minYMargin]
        label.textColor = .secondaryLabelColor; sidebar.addSubview(label)
        web = WKWebView(frame: CGRect(x: 240, y: 0, width: 960, height: 600)); web.autoresizingMask = [.width, .height]
        web.navigationDelegate = self; fixtureRoot.addSubview(web); fixtureWindow.orderFront(nil)
    }
    private func buildPet() {
        petWindow = NSWindow(contentRect: CGRect(x: 1040, y: 100, width: 320, height: 280), styleMask: [.titled, .closable], backing: .buffered, defer: false)
        petWindow.title = "Pet"; petWindow.isReleasedWhenClosed = false
        let view = NSView(frame: CGRect(x: 0, y: 0, width: 320, height: 280)); petWindow.contentView = view
        let image = NSImageView(frame: CGRect(x: 124, y: 10, width: 72, height: 72)); image.imageScaling = .scaleProportionallyUpOrDown
        image.image = NSImage(contentsOf: sourceRoot.appendingPathComponent("public/mascot.png")); view.addSubview(image)
        // The pet anchor surface is original harness geometry; no production pet animation/transport is claimed.
    }
    private func buildControls() {
        controlsWindow = NSWindow(contentRect: CGRect(x: 30, y: 260, width: 438, height: 720), styleMask: [.titled, .closable, .miniaturizable], backing: .buffered, defer: false)
        controlsWindow.title = "Controls"; controlsWindow.isReleasedWhenClosed = false
        let root = NSView(frame: CGRect(x: 0, y: 0, width: 438, height: 720)); controlsWindow.contentView = root
        let heading = NSTextField(labelWithString: ""); heading.font = .systemFont(ofSize: 20, weight: .semibold)
        heading.frame = CGRect(x: 20, y: 677, width: 398, height: 27); root.addSubview(heading)
        let note = NSTextField(wrappingLabelWithString: "")
        note.font = .systemFont(ofSize: 11); note.textColor = .secondaryLabelColor; note.frame = CGRect(x: 20, y: 633, width: 398, height: 36); root.addSubview(note)
        threadPicker = NSPopUpButton(frame: CGRect(x: 20, y: 593, width: 398, height: 28)); threadPicker.addItems(withTitles: ["fixture-thread", "second-fixture-thread"])
        threadPicker.target = self; threadPicker.action = #selector(changeThread); root.addSubview(threadPicker)
        let actions: [(String, Selector)] = [
            ("Start / update browser screenshot", #selector(snapshot)),
            ("Change fixture, deliver next image", #selector(updateFixture)),
            ("Add another browser card (five visible max)", #selector(addCard)),
            ("Add / complete separate computer fixture", #selector(completion)),
            ("Invalidate computer fixture", #selector(invalidateComputer)),
            ("End browser turn (remove browser cards)", #selector(endTurn)),
            ("Interrupt / remove every fixture card", #selector(interrupt)),
            ("Show previews for selected chat", #selector(showThread))
        ]
        for (i, pair) in actions.enumerated() {
            let button = NSButton(title: pair.0, target: self, action: pair.1); button.bezelStyle = .rounded
            button.frame = CGRect(x: 20, y: 553 - i * 38, width: 398, height: 32); root.addSubview(button)
        }
        placementPicker = NSPopUpButton(frame: CGRect(x: 20, y: 222, width: 190, height: 28))
        placementPicker.addItems(withTitles: ["Floating window", "Sidebar", "Pet"]); placementPicker.target = self; placementPicker.action = #selector(changePlacement); root.addSubview(placementPicker)
        anchorPicker = NSPopUpButton(frame: CGRect(x: 222, y: 222, width: 196, height: 28))
        anchorPicker.addItems(withTitles: PiPAlignment.allCases.map { $0.title }); anchorPicker.target = self; anchorPicker.action = #selector(changeAnchor); root.addSubview(anchorPicker)
        slider = NSSlider(value: 200, minValue: 100, maxValue: 400, target: self, action: #selector(resize)); slider.isContinuous = true
        slider.frame = CGRect(x: 20, y: 182, width: 398, height: 26); root.addSubview(slider)
        omitIcon = NSButton(checkboxWithTitle: "Computer completion without an application icon", target: nil, action: nil)
        omitIcon.frame = CGRect(x: 20, y: 158, width: 398, height: 20); root.addSubview(omitIcon)
        summary = NSTextField(wrappingLabelWithString: ""); summary.font = .monospacedSystemFont(ofSize: 11, weight: .regular)
        summary.frame = CGRect(x: 20, y: 114, width: 398, height: 40); root.addSubview(summary)
        status = NSTextField(wrappingLabelWithString: "Loading…")
        status.font = .systemFont(ofSize: 11); status.textColor = .secondaryLabelColor; status.frame = CGRect(x: 20, y: 18, width: 398, height: 88); root.addSubview(status)
    }
    private func refreshControls() {
        guard slider != nil else { return }
        slider.doubleValue = Double(stack.maximum)
        placementPicker.selectItem(at: stack.placement == .pinned ? 0 : stack.placement == .home ? 1 : 2)
        anchorPicker.selectItem(at: stack.alignment.rawValue)
        let count = stack.items.values.filter { $0.threadID == stack.currentThread }.count
        summary.stringValue = "\(stack.visible.count) visible / \(count) stored · max \(Int(stack.maximum))pt\n\(stack.placement.rawValue) · \(stack.alignment.title) · \(stack.schedulerDescription)"
    }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        fixtureReady = true; status.stringValue = "Ready"
    }
    // Prevent this fixture browser from becoming an accidental account/network browser.
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
        decisionHandler(url.isFileURL || url.absoluteString == "about:blank" ? .allow : .cancel)
    }
    private func capture(id: String, producer: PiPProducer, thenComplete: Bool = false) {
        guard fixtureReady else { status.stringValue = "Wait for the local fixture to finish loading."; return }
        let thread = stack.currentThread, turn = browserEpoch[stack.currentThread, default: 0], lifetime = allEpoch
        let includeIcon = omitIcon.state != .on
        let request = requestEpoch[id, default: 0] + 1; requestEpoch[id] = request
        let configuration = WKSnapshotConfiguration(); configuration.rect = web.bounds
        web.takeSnapshot(with: configuration) { [weak self] image, error in
            guard let self = self, self.allEpoch == lifetime, self.requestEpoch[id] == request else { return }
            if producer == .browserImage && self.browserEpoch[thread, default: 0] != turn { return }
            guard let image = image else { self.status.stringValue = error?.localizedDescription ?? "Snapshot unavailable"; return }
            let icon = includeIcon ? NSImage(contentsOf: self.sourceRoot.appendingPathComponent("public/mascot.png")) : nil
            self.stack.upsert(id: id, thread: thread, producer: producer, image: image, icon: icon) { [weak self] in
                self?.fixtureWindow.makeKeyAndOrderFront(nil); NSApp.activate(ignoringOtherApps: true)
            }
            if thenComplete { self.stack.completeComputer(thread: thread) }
            else { self.status.stringValue = "Browser screenshot delivered without recreating an existing card. No page input or live browser surface is embedded in PiP." }
        }
    }
    @objc func snapshot() { capture(id: "browser:\(stack.currentThread):fixture-browser:fixture-tab", producer: .browserImage) }
    @objc func addCard() { serial += 1; capture(id: "browser:\(stack.currentThread):fixture-browser:tab-\(serial)", producer: .browserImage) }
    @objc func updateFixture() {
        let thread = stack.currentThread, lifetime = allEpoch, turn = browserEpoch[stack.currentThread, default: 0]
        web.evaluateJavaScript("fixtureStep(2)") { [weak self] _, error in
            guard let self = self, self.stack.currentThread == thread, self.allEpoch == lifetime, self.browserEpoch[thread, default: 0] == turn else { return }
            if let error = error { self.status.stringValue = error.localizedDescription; return }; self.snapshot()
        }
    }
    @objc func completion() {
        let id = "computer-fixture:\(stack.currentThread)"
        stack.remove(id, animated: false)
        capture(id: id, producer: .simulatedComputer, thenComplete: true)
    }
    @objc func invalidateComputer() {
        requestEpoch["computer-fixture:\(stack.currentThread)", default: 0] += 1
        stack.invalidateComputer(thread: stack.currentThread)
    }
    @objc func endTurn() { browserEpoch[stack.currentThread, default: 0] += 1; stack.endBrowserTurn(thread: stack.currentThread) }
    @objc func interrupt() { allEpoch += 1; stack.invalidateAll(); status.stringValue = "All fixture presentations removed. Completion timers and in-flight captures are invalidated." }
    @objc func showThread() {
        if stack.placement == .pet { petWindow.orderFront(nil) } else { fixtureWindow.orderFront(nil) }
        stack.showCurrentThread()
    }
    @objc func resize() { stack.setMaximum(CGFloat(slider.doubleValue)) }
    @objc func changeThread() { stack.setThread(threadPicker.titleOfSelectedItem ?? "fixture-thread") }
    @objc func changePlacement() { stack.setPlacement([PiPPlacement.pinned, .home, .pet][placementPicker.indexOfSelectedItem]) }
    @objc func changeAnchor() { if let value = PiPAlignment(rawValue: anchorPicker.indexOfSelectedItem) { stack.setAlignment(value) } }
    func applicationWillTerminate(_ notification: Notification) { allEpoch += 1; stack.shutdown() }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}
let root = CommandLine.arguments.count > 1 ? URL(fileURLWithPath: CommandLine.arguments[1]) : URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let app = NSApplication.shared; app.setActivationPolicy(.regular)
let delegate = ReplicaApp(root: root); app.delegate = delegate; app.run()
