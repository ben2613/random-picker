class RandomPicker {
    constructor() {
        this.options = [];
        this.isSpinning = false;
        this.currentRotation = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.updateUI();
    }

    initializeElements() {
        this.optionInput = document.getElementById('optionInput');
        this.addOptionBtn = document.getElementById('addOption');
        this.clearAllBtn = document.getElementById('clearAll');
        this.addRandomOptionsBtn = document.getElementById('addRandomOptions');
        this.spinButton = document.getElementById('spinButton');
        this.optionsContainer = document.getElementById('optionsContainer');
        this.optionCount = document.getElementById('optionCount');
        this.wheel = document.getElementById('wheel');
        this.result = document.getElementById('result');
        this.confettiContainer = document.getElementById('confetti-container');
    }

    bindEvents() {
        this.addOptionBtn.addEventListener('click', () => this.addOption());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        this.addRandomOptionsBtn.addEventListener('click', () => this.addSampleOptions());
        this.spinButton.addEventListener('click', () => this.spinWheel());
        
        this.optionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addOption();
            }
        });

        this.optionInput.addEventListener('input', () => {
            this.addOptionBtn.disabled = !this.optionInput.value.trim();
        });
    }

    addOption() {
        const option = this.optionInput.value.trim();
        if (!option) return;

        if (this.options.includes(option)) {
            this.showNotification('This option already exists!', 'error');
            return;
        }

        this.options.push(option);
        this.optionInput.value = '';
        this.updateUI();
        this.updateWheel();
        this.showNotification(`Added: ${option}`, 'success');
    }

    removeOption(index) {
        this.options.splice(index, 1);
        this.updateUI();
        this.updateWheel();
        this.showNotification('Option removed', 'info');
    }

    clearAll() {
        if (this.options.length === 0) return;
        
        this.options = [];
        this.updateUI();
        this.updateWheel();
        this.showNotification('All options cleared', 'info');
    }

    addSampleOptions() {
        const sampleOptions = [
            'Pizza',
            'Sushi',
            'Burger',
            'Pasta',
            'Salad',
            'Steak',
            'Chicken',
            'Fish',
            'Tacos',
            'Ramen'
        ];

        sampleOptions.forEach(option => {
            if (!this.options.includes(option)) {
                this.options.push(option);
            }
        });

        this.updateUI();
        this.updateWheel();
        this.showNotification('Sample options added!', 'success');
    }

    updateUI() {
        this.optionCount.textContent = this.options.length;
        this.spinButton.disabled = this.options.length < 2;
        
        this.renderOptions();
        this.updateResult();
    }

    renderOptions() {
        this.optionsContainer.innerHTML = '';
        
        if (this.options.length === 0) {
            this.optionsContainer.innerHTML = '<p style="color: #6c757d; text-align: center; font-style: italic;">No options added yet</p>';
            return;
        }

        this.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option-item';
            optionElement.innerHTML = `
                <span>${option}</span>
                <button class="remove-option" onclick="randomPicker.removeOption(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            this.optionsContainer.appendChild(optionElement);
        });
    }

    updateWheel() {
        if (this.options.length === 0) {
            this.wheel.style.background = 'conic-gradient(from 0deg, #e9ecef 0deg 360deg)';
            this.wheel.innerHTML = '<div class="wheel-center"><div class="center-circle"><i class="fas fa-star"></i></div></div>';
            return;
        }

        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
            '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd',
            '#00d2d3', '#ff9f43', '#10ac84', '#ee5a24'
        ];

        const segmentSize = 360 / this.options.length;
        let gradientParts = [];

        this.options.forEach((option, index) => {
            const startAngle = index * segmentSize;
            const endAngle = (index + 1) * segmentSize;
            const color = colors[index % colors.length];
            gradientParts.push(`${color} ${startAngle}deg ${endAngle}deg`);
        });

        this.wheel.style.background = `conic-gradient(from 0deg, ${gradientParts.join(', ')})`;
        
        // Add text labels to the wheel
        this.addWheelLabels();
    }

    addWheelLabels() {
        // Clear existing labels
        const existingLabels = this.wheel.querySelectorAll('.wheel-label');
        existingLabels.forEach(label => label.remove());

        if (this.options.length === 0) return;

        const segmentSize = 360 / this.options.length;
        const wheelRadius = 120; // Reduced radius to center text better within segments

        this.options.forEach((option, index) => {
            const angle = (index * segmentSize) + (segmentSize / 2);
            const radians = (angle - 90) * (Math.PI / 180); // -90 to start from top
            
            const x = Math.cos(radians) * wheelRadius;
            const y = Math.sin(radians) * wheelRadius;

            const label = document.createElement('div');
            label.className = 'wheel-label';
            
            // Truncate long text
            const displayText = option.length > 12 ? option.substring(0, 10) + '...' : option;
            label.textContent = displayText;
            
            // Adjust font size based on text length
            const fontSize = option.length > 8 ? 12 : 14;
            
            label.style.cssText = `
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle + 90}deg);
                color: white;
                font-weight: bold;
                font-size: ${fontSize}px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
                white-space: nowrap;
                z-index: 5;
                pointer-events: none;
                max-width: 80px;
                overflow: hidden;
                text-overflow: ellipsis;
                text-align: center;
            `;

            this.wheel.appendChild(label);
        });

        // Add center circle back
        const centerCircle = document.createElement('div');
        centerCircle.className = 'wheel-center';
        centerCircle.innerHTML = '<div class="center-circle"><i class="fas fa-star"></i></div>';
        this.wheel.appendChild(centerCircle);
    }

    spinWheel() {
        if (this.isSpinning || this.options.length < 2) return;

        // Clear any existing highlights before spinning
        this.clearHighlights();

        this.isSpinning = true;
        this.spinButton.disabled = true;
        this.spinButton.innerHTML = '<div class="loading"></div> Spinning...';

        // Calculate random spin
        const minSpins = 3;
        const maxSpins = 6;
        const spins = Math.random() * (maxSpins - minSpins) + minSpins;
        const totalDegrees = spins * 360;
        
        // Calculate which option will be selected
        const segmentSize = 360 / this.options.length;
        const randomSegment = Math.floor(Math.random() * this.options.length);
        const finalAngle = randomSegment * segmentSize + segmentSize / 2;
        
        const finalRotation = totalDegrees + finalAngle;
        this.currentRotation = finalRotation;

        // Apply spin animation
        this.wheel.style.setProperty('--spin-degrees', `${finalRotation}deg`);
        this.wheel.classList.add('spinning');

        // Update result after spin
        setTimeout(() => {
            // Calculate which option the pointer is actually pointing to
            // The pointer is fixed at the top (0 degrees)
            // The wheel rotates clockwise, so we need to find which original segment is now at the top
            const normalizedRotation = finalRotation % 360;
            
            // If the wheel rotated R degrees clockwise, the segment that was at (360-R) degrees is now at the top
            const originalPosition = (360 - normalizedRotation) % 360;
            const segmentSize = 360 / this.options.length;
            
            // Find which segment contains this position
            const selectedIndex = Math.floor(originalPosition / segmentSize) % this.options.length;
            const selectedOption = this.options[selectedIndex];
            
            console.log(`Final rotation: ${finalRotation}°, Normalized: ${normalizedRotation}°, Original position: ${originalPosition}°, Selected index: ${selectedIndex}, Option: ${selectedOption}`);
            
            this.showResult(selectedOption);
            this.isSpinning = false;
            this.spinButton.disabled = false;
            this.spinButton.innerHTML = '<i class="fas fa-play"></i> SPIN THE WHEEL!';
            
            // Keep the wheel at the final position instead of resetting
            this.wheel.style.transform = `rotate(${finalRotation}deg)`;
            this.wheel.classList.remove('spinning');
        }, 4000);
    }

    showResult(selectedOption) {
        this.result.innerHTML = `<span>🎉 ${selectedOption} 🎉</span>`;
        this.result.classList.add('winner');
        
        // Highlight the winning segment
        this.highlightWinningSegment(selectedOption);
        
        // Create dramatic effects
        this.createConfetti();
        this.createFlyingRibbons();
        this.createHornAnimation();
        this.playWinSound();
        
        setTimeout(() => {
            this.result.classList.remove('winner');
        }, 3000);
    }

    highlightWinningSegment(selectedOption) {
        // Add highlight to the winning option
        const labels = this.wheel.querySelectorAll('.wheel-label');
        labels.forEach(label => {
            if (label.textContent.includes(selectedOption) || 
                (selectedOption.length > 12 && label.textContent.includes(selectedOption.substring(0, 10)))) {
                label.classList.add('highlight');
                
                // Create a non-rotated highlight overlay
                this.createHighlightOverlay(label, selectedOption);
            }
        });
    }

    createHighlightOverlay(label, selectedOption) {
        // Remove any existing overlay
        const existingOverlay = this.wheel.parentElement.querySelector('.highlight-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create a new overlay at a fixed position above the wheel
        const overlay = document.createElement('div');
        overlay.className = 'highlight-overlay';
        overlay.textContent = selectedOption;
        
        overlay.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 18px;
            z-index: 1000;
            box-shadow: 0 8px 25px rgba(0,0,0,0.4);
            animation: highlightBounce 0.6s ease-out;
            white-space: nowrap;
            text-align: center;
            min-width: 80px;
        `;

        // Append to wheel container instead of wheel to avoid rotation transforms
        this.wheel.parentElement.appendChild(overlay);
    }

    clearHighlights() {
        // Remove any existing highlights
        const existingHighlights = this.wheel.querySelectorAll('.wheel-label.highlight');
        existingHighlights.forEach(label => label.classList.remove('highlight'));
        
        // Remove highlight overlay from wheel container
        const existingOverlay = this.wheel.parentElement.querySelector('.highlight-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
    }

    updateResult() {
        if (this.options.length === 0) {
            this.result.innerHTML = '<span>Add some options to start!</span>';
        } else if (this.options.length === 1) {
            this.result.innerHTML = '<span>Add at least one more option to spin!</span>';
        } else {
            this.result.innerHTML = '<span>Ready to spin! 🎯</span>';
        }
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.width = Math.random() * 10 + 5 + 'px';
                confetti.style.height = Math.random() * 10 + 5 + 'px';
                confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
                
                this.confettiContainer.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 4000);
            }, i * 50);
        }
    }

    createFlyingRibbons() {
        const ribbonColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#5f27cd', '#10ac84'];
        
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const ribbon = document.createElement('div');
                ribbon.className = 'flying-ribbon';
                
                const color = ribbonColors[Math.floor(Math.random() * ribbonColors.length)];
                const startX = Math.random() * 100;
                const startY = Math.random() * 50 + 25;
                const endX = startX + (Math.random() - 0.5) * 60;
                const endY = startY + (Math.random() - 0.5) * 60;
                const rotation = Math.random() * 360;
                const scale = Math.random() * 0.5 + 0.5;
                
                ribbon.style.cssText = `
                    position: fixed;
                    left: ${startX}vw;
                    top: ${startY}vh;
                    width: 60px;
                    height: 8px;
                    background: linear-gradient(45deg, ${color}, ${color}dd);
                    border-radius: 4px;
                    z-index: 999;
                    transform: rotate(${rotation}deg) scale(${scale});
                    animation: ribbonFly 3s ease-out forwards;
                `;
                
                // Add ribbon tail
                const tail = document.createElement('div');
                tail.style.cssText = `
                    position: absolute;
                    right: -20px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 20px;
                    height: 4px;
                    background: ${color}aa;
                    border-radius: 2px;
                `;
                ribbon.appendChild(tail);
                
                document.body.appendChild(ribbon);
                
                // Animate the ribbon
                setTimeout(() => {
                    ribbon.style.transform = `translate(${endX - startX}vw, ${endY - startY}vh) rotate(${rotation + 180}deg) scale(${scale * 0.8})`;
                }, 100);
                
                setTimeout(() => {
                    ribbon.remove();
                }, 3000);
            }, i * 200);
        }
    }

    createHornAnimation() {
        // Create horn container
        const hornContainer = document.createElement('div');
        hornContainer.className = 'horn-container';
        hornContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            pointer-events: none;
        `;
        
        // Create horn emoji with animation
        const horn = document.createElement('div');
        horn.innerHTML = '🎺';
        horn.style.cssText = `
            font-size: 80px;
            animation: hornBlast 2s ease-out;
            filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));
        `;
        
        hornContainer.appendChild(horn);
        document.body.appendChild(hornContainer);
        
        // Remove horn after animation
        setTimeout(() => {
            hornContainer.remove();
        }, 2000);
    }

    playWinSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, #dc3545, #e74c3c)';
                break;
            case 'warning':
                notification.style.background = 'linear-gradient(135deg, #ffc107, #fd7e14)';
                break;
            default:
                notification.style.background = 'linear-gradient(135deg, #17a2b8, #6f42c1)';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.randomPicker = new RandomPicker();
});

// Add some keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                if (window.randomPicker && !window.randomPicker.isSpinning) {
                    window.randomPicker.spinWheel();
                }
                break;
            case 'n':
                e.preventDefault();
                document.getElementById('optionInput').focus();
                break;
        }
    }
});
