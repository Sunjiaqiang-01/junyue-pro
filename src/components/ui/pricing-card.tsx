import React from 'react';
import { cn } from '@/lib/utils';

function Card({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'bg-gradient-to-br from-gray-900 to-black relative w-full max-w-xs rounded-2xl',
				'p-1 shadow-2xl backdrop-blur-xl',
				'border border-gray-800 hover:border-primary-gold transition-all duration-300',
				className,
			)}
			{...props}
		/>
	);
}

function Header({
	className,
	children,
	glassEffect = true,
	...props
}: React.ComponentProps<'div'> & {
	glassEffect?: boolean;
}) {
	return (
		<div
			className={cn(
				'bg-gray-900/50 relative mb-4 rounded-xl border border-gray-800 p-6',
				'backdrop-blur-sm',
				className,
			)}
			{...props}
		>
			{/* Top glass gradient */}
			{glassEffect && (
				<div
					aria-hidden="true"
					className="absolute inset-x-0 top-0 h-48 rounded-[inherit] opacity-50"
					style={{
						background:
							'linear-gradient(180deg, rgba(212,175,55,0.1) 0%, rgba(212,175,55,0.05) 40%, rgba(0,0,0,0) 100%)',
					}}
				/>
			)}
			{children}
		</div>
	);
}

function Plan({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn('mb-8 flex items-center justify-between', className)}
			{...props}
		/>
	);
}

function Description({ className, ...props }: React.ComponentProps<'p'>) {
	return (
		<p className={cn('text-gray-400 text-sm', className)} {...props} />
	);
}

function PlanName({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				"text-white flex items-center gap-2 text-lg font-semibold [&_svg:not([class*='size-'])]:size-5",
				className,
			)}
			{...props}
		/>
	);
}

function Badge({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			className={cn(
				'bg-primary-gold/20 border-primary-gold text-primary-gold rounded-full border px-3 py-1 text-xs font-medium',
				className,
			)}
			{...props}
		/>
	);
}

function Price({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div className={cn('mb-4 flex items-end gap-2', className)} {...props} />
	);
}

function MainPrice({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			className={cn('text-4xl font-extrabold tracking-tight text-primary-gold', className)}
			{...props}
		/>
	);
}

function Period({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			className={cn('text-gray-400 pb-1 text-base', className)}
			{...props}
		/>
	);
}

function OriginalPrice({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			className={cn(
				'text-gray-500 mr-1 ml-auto text-lg line-through',
				className,
			)}
			{...props}
		/>
	);
}

function Body({ className, ...props }: React.ComponentProps<'div'>) {
	return <div className={cn('space-y-4 p-6', className)} {...props} />;
}

function List({ className, ...props }: React.ComponentProps<'ul'>) {
	return <ul className={cn('space-y-3', className)} {...props} />;
}

function ListItem({ className, ...props }: React.ComponentProps<'li'>) {
	return (
		<li
			className={cn(
				'text-gray-300 flex items-start gap-3 text-sm leading-relaxed',
				className,
			)}
			{...props}
		/>
	);
}

function Separator({
	children = 'Upgrade to access',
	className,
	...props
}: React.ComponentProps<'div'> & {
	children?: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				'text-gray-400 flex items-center gap-3 text-sm',
				className,
			)}
			{...props}
		>
			<span className="bg-gray-700 h-[1px] flex-1" />
			<span className="text-gray-400 shrink-0">{children}</span>
			<span className="bg-gray-700 h-[1px] flex-1" />
		</div>
	);
}

export {
	Card,
	Header,
	Description,
	Plan,
	PlanName,
	Badge,
	Price,
	MainPrice,
	Period,
	OriginalPrice,
	Body,
	List,
	ListItem,
	Separator,
};

